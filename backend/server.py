from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt as pyjwt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT config
JWT_SECRET = secrets.token_hex(32)
JWT_ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Stripe
stripe_api_key = os.environ.get('STRIPE_API_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ======================== MODELS ========================

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: str

class ProductResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    product_id: str
    name: str
    game: str
    description: str
    features: List[str]
    price: float
    status: str
    status_label: str
    image_url: str
    accent_color: str
    tier: str

class ProductStatusResponse(BaseModel):
    product_id: str
    name: str
    game: str
    status: str
    last_updated: str

class LicenseResponse(BaseModel):
    license_id: str
    product_id: str
    product_name: str
    game: str
    license_key: str
    status: str
    purchased_at: str
    expires_at: str

class TransactionResponse(BaseModel):
    transaction_id: str
    product_id: str
    product_name: str
    amount: float
    currency: str
    status: str
    created_at: str

class ReviewResponse(BaseModel):
    review_id: str
    user_name: str
    product_name: str
    rating: int
    text: str
    created_at: str

# ======================== AUTH HELPERS ========================

def create_jwt_token(user_id: str, email: str):
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str):
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except pyjwt.ExpiredSignatureError:
        return None
    except pyjwt.InvalidTokenError:
        return None

async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Check if it's a Google OAuth session token
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session_doc:
        expires_at = session_doc["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        user = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    # Check JWT token
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ======================== AUTH ROUTES ========================

@api_router.post("/auth/register")
async def register(data: UserRegister, response: Response):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = pwd_context.hash(data.password)
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hashed_pw,
        "picture": None,
        "created_at": now
    }
    await db.users.insert_one(user_doc)
    
    token = create_jwt_token(user_id, data.email)
    response.set_cookie(
        key="session_token", value=token, httponly=True,
        secure=True, samesite="none", path="/", max_age=7*24*3600
    )
    return {"token": token, "user": {"user_id": user_id, "email": data.email, "name": data.name, "picture": None, "created_at": now}}

@api_router.post("/auth/login")
async def login(data: UserLogin, response: Response):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or "password_hash" not in user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["user_id"], user["email"])
    response.set_cookie(
        key="session_token", value=token, httponly=True,
        secure=True, samesite="none", path="/", max_age=7*24*3600
    )
    return {"token": token, "user": {"user_id": user["user_id"], "email": user["email"], "name": user["name"], "picture": user.get("picture"), "created_at": user["created_at"]}}

@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return {"user_id": user["user_id"], "email": user["email"], "name": user["name"], "picture": user.get("picture"), "created_at": user.get("created_at", "")}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie(key="session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/google/session")
async def google_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        data = resp.json()
    
    email = data["email"]
    name = data.get("name", "")
    picture = data.get("picture", "")
    session_token = data.get("session_token", secrets.token_hex(32))
    
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token", value=session_token, httponly=True,
        secure=True, samesite="none", path="/", max_age=7*24*3600
    )
    return {"token": session_token, "user": {"user_id": user_id, "email": email, "name": name, "picture": picture}}

# ======================== PRODUCTS ========================

PRODUCTS = [
    # Rust
    {"product_id": "rust-disconnect", "name": "Disconnect", "game": "Rust", "description": "Premium external Rust tool with full ESP, aimbot, and miscellaneous features. Unmatched performance.", "features": ["ESP/Wallhack", "Aimbot", "Loot ESP", "Player Info", "Recoil Control"], "price": 29.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-rust-1.jpg", "accent_color": "#00D4FF", "tier": "Premium"},
    {"product_id": "rust-fluent", "name": "Fluent", "game": "Rust", "description": "Lightweight Rust tool focused on legit gameplay. Clean UI with essential features.", "features": ["ESP", "Soft Aimbot", "Radar", "No Recoil"], "price": 19.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-rust-2.jpg", "accent_color": "#39FF14", "tier": "Standard"},
    {"product_id": "rust-serenity", "name": "Serenity", "game": "Rust", "description": "Budget-friendly option with core features for casual players.", "features": ["ESP", "Basic Aimbot", "Radar"], "price": 12.99, "status": "testing", "status_label": "Testing", "image_url": "/placeholder-rust-3.jpg", "accent_color": "#00D4FF", "tier": "Lite"},
    # Valorant
    {"product_id": "val-phantom", "name": "Phantom", "game": "Valorant", "description": "Top-tier Valorant enhancement with advanced triggerbot and ESP systems.", "features": ["Triggerbot", "ESP", "Radar Hack", "Skin Changer", "Stream Proof"], "price": 34.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-val-1.jpg", "accent_color": "#FF0055", "tier": "Premium"},
    {"product_id": "val-spectre", "name": "Spectre", "game": "Valorant", "description": "Lightweight external tool for competitive Valorant.", "features": ["ESP", "Radar", "Glow ESP"], "price": 14.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-val-2.jpg", "accent_color": "#00D4FF", "tier": "Standard"},
    # Marvel Rivals
    {"product_id": "mr-infinity", "name": "Infinity", "game": "Marvel Rivals", "description": "Dominate Marvel Rivals with advanced aim assist and wall vision.", "features": ["Aimbot", "ESP", "Hero Tracker", "Ability Cooldown"], "price": 24.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-mr-1.jpg", "accent_color": "#39FF14", "tier": "Premium"},
    {"product_id": "mr-nexus", "name": "Nexus", "game": "Marvel Rivals", "description": "Essential toolkit for Marvel Rivals players.", "features": ["ESP", "Radar", "Hero Info"], "price": 14.99, "status": "updating", "status_label": "Updating", "image_url": "/placeholder-mr-2.jpg", "accent_color": "#00D4FF", "tier": "Standard"},
    # Overwatch
    {"product_id": "ow-vortex", "name": "Vortex", "game": "Overwatch", "description": "Full-featured Overwatch 2 enhancement suite.", "features": ["Aimbot", "ESP", "Triggerbot", "Prediction", "Stream Proof"], "price": 29.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-ow-1.jpg", "accent_color": "#FFD600", "tier": "Premium"},
    {"product_id": "ow-pulse", "name": "Pulse", "game": "Overwatch", "description": "Clean external tool for OW2 competitive.", "features": ["ESP", "Radar", "Glow"], "price": 16.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-ow-2.jpg", "accent_color": "#00D4FF", "tier": "Standard"},
    # Arc Raiders
    {"product_id": "arc-titan", "name": "Titan", "game": "Arc Raiders", "description": "Early access Arc Raiders tool with full feature set.", "features": ["ESP", "Aimbot", "Loot Hack", "Radar"], "price": 22.99, "status": "testing", "status_label": "Testing", "image_url": "/placeholder-arc-1.jpg", "accent_color": "#39FF14", "tier": "Premium"},
    # CS2
    {"product_id": "cs2-division", "name": "Division", "game": "CS2", "description": "The ultimate CS2 enhancement. Trusted by thousands.", "features": ["Aimbot", "Wallhack", "ESP", "Triggerbot", "Bhop", "Skin Changer"], "price": 34.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-cs2-1.jpg", "accent_color": "#00D4FF", "tier": "Premium"},
    {"product_id": "cs2-quantum", "name": "Quantum", "game": "CS2", "description": "Budget CS2 option for casual play.", "features": ["ESP", "Radar", "Bhop"], "price": 12.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-cs2-2.jpg", "accent_color": "#39FF14", "tier": "Standard"},
    # Minecraft
    {"product_id": "mc-obsidian", "name": "Obsidian", "game": "Minecraft", "description": "Premium Minecraft client with PvP and utility modules.", "features": ["KillAura", "ESP", "Fly", "Speed", "X-Ray", "AutoBuild"], "price": 19.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-mc-1.jpg", "accent_color": "#39FF14", "tier": "Premium"},
    {"product_id": "mc-bedrock", "name": "Bedrock", "game": "Minecraft", "description": "Lightweight Minecraft utility mod.", "features": ["ESP", "X-Ray", "Speed", "Fly"], "price": 9.99, "status": "undetected", "status_label": "Undetected", "image_url": "/placeholder-mc-2.jpg", "accent_color": "#00D4FF", "tier": "Lite"},
]

REVIEWS = [
    {"review_id": "r1", "user_name": "Skyline", "product_name": "Disconnect", "rating": 5, "text": "Best external Rust tool I've used. ESP is crystal clear.", "created_at": "2025-12-01T10:00:00Z"},
    {"review_id": "r2", "user_name": "Arcturus", "product_name": "Division", "rating": 5, "text": "Been using Division for 3 months. Absolutely solid.", "created_at": "2025-11-20T14:00:00Z"},
    {"review_id": "r3", "user_name": "NotFlokii", "product_name": "Phantom", "rating": 5, "text": "Phantom is unmatched for Valorant. Stream proof is a game changer.", "created_at": "2025-11-15T09:00:00Z"},
    {"review_id": "r4", "user_name": "rzvisualz", "product_name": "Infinity", "rating": 5, "text": "Marvel Rivals domination. Hero tracker is insane.", "created_at": "2025-10-28T16:00:00Z"},
    {"review_id": "r5", "user_name": "SpinXO_", "product_name": "Vortex", "rating": 5, "text": "Vortex prediction system is next level for OW2.", "created_at": "2025-10-15T11:00:00Z"},
    {"review_id": "r6", "user_name": "Jake2154", "product_name": "Obsidian", "rating": 5, "text": "Best MC client on the market. KillAura is smooth.", "created_at": "2025-09-20T13:00:00Z"},
    {"review_id": "r7", "user_name": "Hekieee", "product_name": "Quantum", "rating": 5, "text": "Great budget CS2 option. Radar is super useful.", "created_at": "2025-09-10T08:00:00Z"},
    {"review_id": "r8", "user_name": "Dayne20", "product_name": "Fluent", "rating": 5, "text": "Fluent is perfect for legit play. Clean and smooth.", "created_at": "2025-08-25T15:00:00Z"},
    {"review_id": "r9", "user_name": "twat2", "product_name": "Titan", "rating": 4, "text": "Arc Raiders tool works great. Waiting for more features.", "created_at": "2025-08-10T12:00:00Z"},
    {"review_id": "r10", "user_name": "1pacAday", "product_name": "Spectre", "rating": 5, "text": "Lightweight and reliable. Exactly what I needed for ranked.", "created_at": "2025-07-30T10:00:00Z"},
]

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(game: Optional[str] = None):
    if game:
        return [p for p in PRODUCTS if p["game"].lower() == game.lower()]
    return PRODUCTS

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    for p in PRODUCTS:
        if p["product_id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")

@api_router.get("/product-status", response_model=List[ProductStatusResponse])
async def get_product_status():
    return [{"product_id": p["product_id"], "name": p["name"], "game": p["game"], "status": p["status"], "last_updated": "2025-12-15T08:00:00Z"} for p in PRODUCTS]

@api_router.get("/reviews", response_model=List[ReviewResponse])
async def get_reviews():
    return REVIEWS

@api_router.get("/games")
async def get_games():
    games = list(set(p["game"] for p in PRODUCTS))
    games.sort()
    game_data = []
    for g in games:
        products = [{"product_id": p["product_id"], "name": p["name"], "tier": p["tier"], "price": p["price"], "status": p["status"]} for p in PRODUCTS if p["game"] == g]
        game_data.append({"name": g, "products": products})
    return game_data

# ======================== STRIPE CHECKOUT ========================

# Backend defines all packages - never accept amounts from frontend
PRODUCT_PACKAGES = {p["product_id"]: {"name": p["name"], "game": p["game"], "price": p["price"]} for p in PRODUCTS}

@api_router.post("/checkout/create")
async def create_checkout(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    product_id = body.get("product_id")
    origin_url = body.get("origin_url")
    duration = body.get("duration", "monthly")  # daily, weekly, monthly
    
    if not product_id or product_id not in PRODUCT_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid product")
    if not origin_url:
        raise HTTPException(status_code=400, detail="Missing origin URL")
    
    pkg = PRODUCT_PACKAGES[product_id]
    price = float(pkg["price"])
    
    # Adjust price by duration
    if duration == "daily":
        price = round(price / 4, 2)
    elif duration == "weekly":
        price = round(price / 2, 2)
    
    success_url = f"{origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/products/{product_id}"
    
    metadata = {
        "product_id": product_id,
        "user_id": user["user_id"],
        "duration": duration,
        "product_name": pkg["name"],
        "game": pkg["game"]
    }
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_req = CheckoutSessionRequest(
        amount=price,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)
    
    # Create pending transaction
    transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    await db.payment_transactions.insert_one({
        "transaction_id": transaction_id,
        "session_id": session.session_id,
        "product_id": product_id,
        "product_name": pkg["name"],
        "game": pkg["game"],
        "user_id": user["user_id"],
        "amount": price,
        "currency": "usd",
        "duration": duration,
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request, user=Depends(get_current_user)):
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_stat = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    txn = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if txn and txn.get("payment_status") != "paid":
        new_status = checkout_stat.payment_status
        update_data = {"payment_status": new_status, "status": checkout_stat.status}
        
        if new_status == "paid":
            # Generate license key
            license_key = f"CC-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
            duration = txn.get("duration", "monthly")
            days = {"daily": 1, "weekly": 7, "monthly": 30}.get(duration, 30)
            expires = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
            
            await db.licenses.insert_one({
                "license_id": f"lic_{uuid.uuid4().hex[:12]}",
                "product_id": txn["product_id"],
                "product_name": txn["product_name"],
                "game": txn.get("game", ""),
                "user_id": txn["user_id"],
                "license_key": license_key,
                "status": "active",
                "duration": duration,
                "purchased_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": expires
            })
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
    
    return {
        "status": checkout_stat.status,
        "payment_status": checkout_stat.payment_status,
        "amount_total": checkout_stat.amount_total,
        "currency": checkout_stat.currency,
        "metadata": checkout_stat.metadata
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        if webhook_response.payment_status == "paid":
            txn = await db.payment_transactions.find_one({"session_id": webhook_response.session_id}, {"_id": 0})
            if txn and txn.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete"}}
                )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ======================== USER DASHBOARD ========================

@api_router.get("/licenses")
async def get_licenses(user=Depends(get_current_user)):
    licenses = await db.licenses.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return licenses

@api_router.get("/transactions")
async def get_transactions(user=Depends(get_current_user)):
    txns = await db.payment_transactions.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return txns

# ======================== STATS ========================

@api_router.get("/stats")
async def get_stats():
    return {
        "total_products": len(PRODUCTS),
        "total_games": len(set(p["game"] for p in PRODUCTS)),
        "undetected_count": len([p for p in PRODUCTS if p["status"] == "undetected"]),
        "total_reviews": len(REVIEWS)
    }

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
