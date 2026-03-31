# 🧪 Testing Guide - Admin Dashboard

## Pre-Testing Checklist

Before running tests, ensure:
- [ ] Node.js v16+ installed
- [ ] PHP 8.0+ installed
- [ ] MySQL/PostgreSQL running
- [ ] Composer installed
- [ ] Port 8000 (backend) available
- [ ] Port 5173 (frontend) available

---

## Step 1: Backend Setup & Testing

### Install & Configure Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate key
php artisan key:generate

# Configure database in .env
# Set: DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Run migrations
php artisan migrate:fresh --seed

# Start server
php artisan serve
```

### Test Backend Connectivity

**Test 1: Health Check**
```bash
curl http://localhost:8000/api/v1/ping
```

Expected Response:
```json
{
  "status": "success",
  "message": "Backend is working properly 🚀"
}
```

**Test 2: Dashboard Endpoint**
```bash
curl -H "Authorization: Bearer {YOUR_TOKEN}" \
  http://localhost:8000/api/v1/dashboard
```

**Test 3: Login & Get Token**
```bash
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "password123"
  }'
```

---

## Step 2: Frontend Setup & Testing

### Install & Configure Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Verify API URL in src/Services/api.ts
# Should be: http://localhost:8000/api/v1

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

### Manual Testing

**Test 1: Login Page**
1. Open `http://localhost:5173`
2. Enter credentials:
   - Email: `admin@hospital.com`
   - Password: `password123`
3. Click Login
4. Should redirect to dashboard

**Test 2: Dashboard Loading**
1. Visit `http://localhost:5173/admin`
2. Verify KPI cards display values
3. Check for any console errors (F12)

**Test 3: Real-time Updates**
1. Open dashboard
2. Open DevTools Network tab
3. Watch API calls every 5 seconds
4. Verify data updates in UI

---

## Step 3: API Endpoint Testing

### Using Postman/Insomnia

**Setup:**
1. Create new Postman environment
2. Add variable: `base_url = http://localhost:8000/api/v1`
3. Add variable: `token = YOUR_TOKEN_FROM_LOGIN`

### Test Endpoints

#### Statistics
```
GET /api/v1/dashboard
Headers: Authorization: Bearer {token}
```

#### Users
```
GET /api/v1/dashboard/users
PUT /api/v1/dashboard/users/1
DELETE /api/v1/dashboard/users/1
Headers: Authorization: Bearer {token}
```

#### Medicines
```
GET /api/v1/dashboard/medicines
PUT /api/v1/dashboard/medicines/1
Headers: Authorization: Bearer {token}
```

#### Deliveries
```
GET /api/v1/dashboard/deliveries
PUT /api/v1/dashboard/deliveries/1/status
Body: {
  "status": "approved",
  "notes": "Approved for shipment"
}
Headers: Authorization: Bearer {token}
```

#### System Health
```
GET /api/v1/dashboard/system-health
Headers: Authorization: Bearer {token}
```

---

## Step 4: Feature Testing

### Test 1: User Management
- [ ] Navigate to Users tab
- [ ] Verify users list loads
- [ ] Check pagination works
- [ ] Click Edit button
- [ ] Verify user data displayed
- [ ] Try to delete a user
- [ ] Confirm deletion dialog appears

### Test 2: Medicine Management
- [ ] Navigate to Medicines tab
- [ ] Verify medicines list loaded
- [ ] Check stock status colors
- [ ] View expiry dates
- [ ] Click Edit button

### Test 3: Delivery Management
- [ ] Navigate to Deliveries tab
- [ ] Filter by status (All, Pending, Approved)
- [ ] Click Approve on pending delivery
- [ ] Verify status updated
- [ ] Check activity log

### Test 4: Inventory Management
- [ ] Navigate to Inventory tab
- [ ] Verify quantities displayed
- [ ] Check stock level badges
- [ ] Click Edit to update quantity
- [ ] Verify update succeeds

### Test 5: Real-time Updates
- [ ] Open Network tab in DevTools
- [ ] Watch API calls frequency (should be ~5 seconds)
- [ ] Modify data in database directly
- [ ] Wait for refresh
- [ ] Verify UI updates automatically

### Test 6: Error Handling
- [ ] Stop backend server
- [ ] Try to load data
- [ ] Verify error message displays
- [ ] Start server back
- [ ] Click retry/refresh
- [ ] Verify data loads again

---

## Step 5: Performance Testing

### Load Testing Metrics

**Dashboard Load Time:**
```javascript
// In browser console
performance.mark('start');
// ... perform action ...
performance.mark('end');
performance.measure('duration', 'start', 'end');
console.log(performance.getEntriesByName('duration')[0]);
```

**Expected Times:**
- Initial load: < 3 seconds
- Subsequent refreshes: < 500ms
- Page transitions: < 1 second

### Network Performance
Check DevTools Network tab:
- XHR requests should be < 100ms
- Response sizes should be < 100KB

---

## Step 6: Security Testing

### Authentication Test
1. Delete token from localStorage
2. Refresh page
3. Should redirect to login

### Authorization Test
1. Login as non-admin user
2. Try to access `/admin`
3. Should be redirected or show error

### CORS Test
```javascript
// In browser console
fetch('http://localhost:8000/api/v1/dashboard', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## Step 7: Browser Compatibility Testing

Test on these browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

Expected behavior:
- UI fully responsive
- Buttons clickable
- Forms functional
- Data displays correctly

---

## Step 8: Database Testing

### Verify Data Integrity

```sql
-- Check users
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as admin_users FROM users WHERE specialisation = 'Admin';

-- Check medicines
SELECT COUNT(*) as total_medicines FROM medicines;
SELECT COUNT(*) as low_stock FROM medicine_inventory WHERE quantity < 10;

-- Check activity logs
SELECT COUNT(*) as total_logs FROM activity_logs;
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;

-- Check pending deliveries
SELECT COUNT(*) as pending FROM deliveries WHERE status = 'pending';
```

---

## Automated Testing (Optional)

### Unit Tests - Backend

```bash
# Run PHPUnit tests
cd backend
php artisan test

# Run specific test
php artisan test --filter=DashboardControllerTest
```

### Unit Tests - Frontend

```bash
# Run Jest tests
cd frontend
npm run test

# Watch mode
npm run test -- --watch
```

---

## Debugging Tips

### Frontend Debugging
```javascript
// Enable debug logging
localStorage.setItem('DEBUG', 'true');

// Check stored data
console.log(JSON.parse(localStorage.getItem('token')));
console.log(localStorage.getItem('userRole'));

// Monitor API calls
window.debugAPI = true;
```

### Backend Debugging
```bash
# Tail Laravel logs
tail -f storage/logs/laravel.log

# Use Tinker for debugging
php artisan tinker
> User::count()
> Activity::latest()->first()
```

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution:**
- Check `config/cors.php` includes frontend URL
- Verify `SANCTUM_STATEFUL_DOMAINS` in `.env`

### Issue: 401 Unauthorized
**Solution:**
- Re-login to get new token
- Check token in localStorage
- Verify token format in Authorization header

### Issue: Blank Dashboard
**Solution:**
- Check browser console for errors
- Verify database has data
- Check API endpoint in DevTools Network

### Issue: Slow Loading
**Solution:**
- Check database query performance
- Verify no N+1 queries
- Use Laravel Debugbar
- Profile frontend with DevTools

---

## Test Results Checklist

After completing all tests, verify:

- [ ] No console errors in browser
- [ ] No backend PHP errors
- [ ] All API responses 200 OK
- [ ] Data displays correctly
- [ ] Real-time updates working
- [ ] Forms submit successfully
- [ ] Error handling works
- [ ] Mobile view responsive
- [ ] Performance acceptable
- [ ] Security checks pass

---

## Sign-off

When all tests pass, the system is ready for:
- [ ] Local development
- [ ] Team testing
- [ ] Staging deployment
- [ ] Production release

---

**Last Updated:** March 26, 2026  
**Testing Version:** 1.0  
**Status:** Ready for Testing
