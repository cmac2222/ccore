#!/usr/bin/env python3

import requests
import sys
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List

class CheatcoreAPITester:
    def __init__(self, base_url="https://dark-suite.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.session_cookies = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({"test": name, "error": details})
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method: str, endpoint: str, data: Dict = None, expected_status: int = 200) -> tuple:
        """Make API request and validate status"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {"Content-Type": "application/json"}
        
        if self.session_cookies:
            cookies = self.session_cookies
        else:
            cookies = None
            
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, cookies=cookies, timeout=30)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=30)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, cookies=cookies, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, cookies=cookies, timeout=30)

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}

            return success, response, response_data
            
        except Exception as e:
            return False, None, {"error": str(e)}

    def test_basic_endpoints(self):
        """Test basic public endpoints"""
        print("\n🔍 Testing Basic Public Endpoints...")
        
        # Test products endpoint
        success, resp, data = self.make_request("GET", "/products")
        if success:
            products_count = len(data) if isinstance(data, list) else 0
            self.log_test(f"GET /api/products ({products_count} products)", success, f"Returned {products_count} products")
        else:
            error_msg = data.get('error', 'Failed to fetch products')
            self.log_test("GET /api/products", success, error_msg)

        # Test games endpoint
        success, resp, data = self.make_request("GET", "/games")
        if success:
            games_count = len(data) if isinstance(data, list) else 0
            self.log_test(f"GET /api/games ({games_count} games)", success, f"Returned {games_count} games")
        else:
            self.log_test("GET /api/games", success, data.get('error', 'Failed'))

        # Test product status endpoint
        success, resp, data = self.make_request("GET", "/product-status")
        self.log_test("GET /api/product-status", success, data.get('error', ''))

        # Test reviews endpoint
        success, resp, data = self.make_request("GET", "/reviews")
        if success:
            reviews_count = len(data) if isinstance(data, list) else 0
            self.log_test(f"GET /api/reviews ({reviews_count} reviews)", success)
        else:
            self.log_test("GET /api/reviews", success, data.get('error', ''))

        # Test stats endpoint
        success, resp, data = self.make_request("GET", "/stats")
        self.log_test("GET /api/stats", success, data.get('error', ''))

        # Test individual product
        success, resp, data = self.make_request("GET", "/products/rust-disconnect")
        self.log_test("GET /api/products/{id} (rust-disconnect)", success, data.get('error', ''))

    def test_auth_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime("%H%M%S")
        test_email = f"test_user_{timestamp}@example.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"

        success, resp, data = self.make_request(
            "POST", "/auth/register",
            {
                "email": test_email,
                "password": test_password,
                "name": test_name
            },
            expected_status=200
        )
        
        if success and resp:
            self.session_cookies = resp.cookies
            if "token" in data:
                self.token = data["token"]
            self.test_email = test_email
            self.test_password = test_password
            self.log_test("POST /api/auth/register", True, f"Registered user: {test_email}")
        else:
            error_detail = data.get('detail', data.get('error', 'Registration failed'))
            self.log_test("POST /api/auth/register", False, error_detail)

    def test_auth_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if not hasattr(self, 'test_email'):
            self.log_test("POST /api/auth/login", False, "No test user to login with")
            return

        success, resp, data = self.make_request(
            "POST", "/auth/login", 
            {
                "email": self.test_email,
                "password": self.test_password
            },
            expected_status=200
        )
        
        if success and resp:
            self.session_cookies = resp.cookies
            if "token" in data:
                self.token = data["token"]
            self.log_test("POST /api/auth/login", True, f"Logged in user: {self.test_email}")
        else:
            error_detail = data.get('detail', data.get('error', 'Login failed'))
            self.log_test("POST /api/auth/login", False, error_detail)

    def test_auth_me(self):
        """Test auth/me endpoint"""
        print("\n🔍 Testing Auth Me Endpoint...")
        
        success, resp, data = self.make_request("GET", "/auth/me", expected_status=200)
        if success:
            user_id = data.get('user_id', '')
            email = data.get('email', '')
            self.log_test("GET /api/auth/me", True, f"User: {email}")
        else:
            error_detail = data.get('detail', data.get('error', 'Auth me failed'))
            self.log_test("GET /api/auth/me", False, error_detail)

    def test_protected_endpoints(self):
        """Test protected endpoints that require authentication"""
        print("\n🔍 Testing Protected Endpoints...")
        
        if not self.token and not self.session_cookies:
            self.log_test("Protected endpoints", False, "No authentication token available")
            return

        # Test licenses endpoint
        success, resp, data = self.make_request("GET", "/licenses", expected_status=200)
        if success:
            licenses_count = len(data) if isinstance(data, list) else 0
            self.log_test(f"GET /api/licenses ({licenses_count} licenses)", True)
        else:
            self.log_test("GET /api/licenses", False, data.get('detail', data.get('error', 'Failed')))

        # Test transactions endpoint
        success, resp, data = self.make_request("GET", "/transactions", expected_status=200)
        if success:
            txns_count = len(data) if isinstance(data, list) else 0
            self.log_test(f"GET /api/transactions ({txns_count} transactions)", True)
        else:
            self.log_test("GET /api/transactions", False, data.get('detail', data.get('error', 'Failed')))

    def test_checkout_flow(self):
        """Test Stripe checkout creation"""
        print("\n🔍 Testing Stripe Checkout Flow...")
        
        if not self.token and not self.session_cookies:
            self.log_test("Stripe checkout", False, "No authentication token available")
            return

        # Test checkout creation
        checkout_data = {
            "product_id": "rust-disconnect", 
            "origin_url": self.base_url,
            "duration": "monthly"
        }
        
        success, resp, data = self.make_request(
            "POST", "/checkout/create", 
            checkout_data,
            expected_status=200
        )
        
        if success:
            checkout_url = data.get('url', '')
            session_id = data.get('session_id', '')
            self.log_test("POST /api/checkout/create", True, f"Session: {session_id}")
            
            # Test checkout status if we have session_id
            if session_id:
                success, resp, data = self.make_request("GET", f"/checkout/status/{session_id}", expected_status=200)
                self.log_test("GET /api/checkout/status/{id}", success, data.get('error', ''))
        else:
            error_detail = data.get('detail', data.get('error', 'Checkout creation failed'))
            self.log_test("POST /api/checkout/create", False, error_detail)

    def test_invalid_routes(self):
        """Test invalid routes and error handling"""
        print("\n🔍 Testing Error Handling...")
        
        # Test non-existent product
        success, resp, data = self.make_request("GET", "/products/nonexistent", expected_status=404)
        self.log_test("GET /api/products/nonexistent (404 expected)", success)
        
        # Test auth/me without token
        old_token = self.token
        old_cookies = self.session_cookies
        self.token = None
        self.session_cookies = None
        success, resp, data = self.make_request("GET", "/auth/me", expected_status=401)
        self.log_test("GET /api/auth/me without auth (401 expected)", success)
        self.token = old_token
        self.session_cookies = old_cookies

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting Cheatcore API Tests")
        print(f"Testing backend at: {self.api_url}")
        
        # Basic endpoints
        self.test_basic_endpoints()
        
        # Auth flow
        self.test_auth_registration()
        self.test_auth_login()
        self.test_auth_me()
        
        # Protected endpoints
        self.test_protected_endpoints()
        
        # Stripe checkout
        self.test_checkout_flow()
        
        # Error handling
        self.test_invalid_routes()
        
        # Print final results
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for fail in self.failed_tests:
                print(f"  • {fail['test']}: {fail['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        return success_rate >= 80  # 80% success threshold

def main():
    tester = CheatcoreAPITester()
    success = tester.run_all_tests()
    
    # Save results
    results = {
        "tests_run": tester.tests_run,
        "tests_passed": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0,
        "failed_tests": tester.failed_tests,
        "test_results": tester.test_results,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        with open("/app/backend_test_results.json", "w") as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Results saved to /app/backend_test_results.json")
    except Exception as e:
        print(f"\n⚠️ Failed to save results: {e}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())