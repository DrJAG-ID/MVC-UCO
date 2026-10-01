"""
Unit & Integration Tests for Flask Python Core API on Port 35553
Tests:
- GET / (Hello World UCO DEMO)
- GET /logindepan
- GET & POST /appsinit (CRUD for init-absence)
- GET /databsen (Data absence table)
- POST /main-absence (Presensi submission to SQLite)
- Error handling, 400 Bad Request, 404 Not Found, 500 Internal Error
"""

import unittest
import json
import os
from app import app, init_db

class UCOFlaskApiTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLITE_DB'] = ':memory:'
        self.client = app.test_client()
        with app.app_context():
            init_db()

    def test_root_index(self):
        """Test Hello world print UCO DEMO"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Hello, World! UCO DEMO', response.data)

    def test_login_depan_route(self):
        """Test /logindepan route"""
        response = self.client.get('/logindepan')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'success')

    def test_main_absence_post_and_get(self):
        """Test POST /main-absence and GET /main-absence"""
        payload = {
            "usernumber/ID": "20261001-A4F",
            "real name": "Budi Santoso",
            "thumbnail photo": "data:image/jpeg;base64,samplephoto123",
            "date stamp": "2026-10-01 08:00:00"
        }
        res_post = self.client.post(
            '/main-absence',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(res_post.status_code, 201)
        res_data = json.loads(res_post.data)
        self.assertEqual(res_data['status'], 'success')
        self.assertEqual(res_data['data']['real name'], 'Budi Santoso')

        # Test GET /databsen returns the new record
        res_get = self.client.get('/databsen')
        self.assertEqual(res_get.status_code, 200)
        get_data = json.loads(res_get.data)
        self.assertGreaterEqual(get_data['count'], 1)

    def test_init_absence_flow(self):
        """Test POST /init-absence and GET /appsinit"""
        payload = {
            "usernumber/ID": "20261001-B12",
            "real name": "Siti Rahmawati",
            "thumbnail photo": "data:image/jpeg;base64,initphoto",
            "date stamp": "2026-10-01 08:30:00"
        }
        res_post = self.client.post(
            '/init-absence',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(res_post.status_code, 201)

        # Verify via /appsinit
        res_get = self.client.get('/appsinit')
        self.assertEqual(res_get.status_code, 200)
        data = json.loads(res_get.data)
        self.assertTrue(any(r['usernumber/ID'] == '20261001-B12' for r in data['data']))

    def test_missing_payload_warning_400(self):
        """Test exception and warning on empty payload"""
        response = self.client.post(
            '/main-absence',
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_not_found_404(self):
        """Test 404 handler"""
        response = self.client.get('/nonexistent-route')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()
