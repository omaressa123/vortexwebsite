"""
Vortex Agent - Project Status and Testing Script
"""
import requests
import json
import time

def test_api_endpoints():
    """Test all API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Vortex Agent API Endpoints...")
    print("=" * 50)
    
    # Test 1: Main page
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Main page: {response.status_code}")
    except:
        print("❌ Main page: Failed")
    
    # Test 2: Admin login page
    try:
        response = requests.get(f"{base_url}/backendoverviewpage")
        print(f"✅ Admin login page: {response.status_code}")
    except:
        print("❌ Admin login page: Failed")
    
    # Test 3: Admin login API
    try:
        login_data = {
            "username": "omaressa",
            "password": "omressa123"
        }
        response = requests.post(f"{base_url}/api/admin/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin login API: {response.status_code} - {data.get('username')}")
            token = data.get('token')
        else:
            print(f"❌ Admin login API: {response.status_code}")
            token = None
    except:
        print("❌ Admin login API: Failed")
        token = None
    
    # Test 4: Get users (with token if available)
    try:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = requests.get(f"{base_url}/api/admin/users", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get users API: {response.status_code} - {len(data.get('users', []))} users")
        else:
            print(f"⚠️ Get users API: {response.status_code}")
    except:
        print("❌ Get users API: Failed")
    
    # Test 5: Dashboard stats
    try:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = requests.get(f"{base_url}/api/admin/dashboard/stats", headers=headers)
        if response.status_code == 200:
            data = response.json()
            stats = data.get('stats', {})
            print(f"✅ Dashboard stats: {response.status_code} - {stats.get('total_users', 0)} users")
        else:
            print(f"⚠️ Dashboard stats: {response.status_code}")
    except:
        print("❌ Dashboard stats: Failed")
    
    print("=" * 50)
    print("🎯 Testing completed!")
    print("🌐 Application is running at: http://localhost:5000")
    print("🔐 Admin login: omaressa / omressa123")

if __name__ == "__main__":
    test_api_endpoints()
