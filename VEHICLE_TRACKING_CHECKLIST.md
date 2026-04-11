# Vehicle Tracking System - Quick Setup & Testing Checklist

## ✅ Pre-Deployment Checklist

### Backend Setup
- [ ] Database migrations created
  - [ ] `2026_04_09_100000_create_vehicles_table.php`
  - [ ] `2026_04_09_100100_create_vehicle_locations_table.php`
  - [ ] `2026_04_09_100200_add_vehicle_id_to_deliveries_table.php`

- [ ] Models created
  - [ ] `app/Models/Vehicle.php`
  - [ ] `app/Models/VehicleLocation.php`

- [ ] Controller created
  - [ ] `app/Http/Controllers/VehicleController.php`

- [ ] Routes added to `routes/api.php`
  - [ ] All vehicle endpoints registered
  - [ ] Location tracking endpoints registered

### Frontend Setup
- [ ] API service created
  - [ ] `frontend/src/Services/vehicleAPI.ts`

- [ ] Components created
  - [ ] `frontend/src/pages/Admin/VehicleRegistration.tsx`
  - [ ] `frontend/src/pages/Admin/VehicleTracking.tsx`

- [ ] CSS files created
  - [ ] `frontend/src/pages/Admin/VehicleRegistration.css`
  - [ ] `frontend/src/pages/Admin/VehicleTracking.css`

- [ ] Admin Dashboard updated
  - [ ] Import statements added
  - [ ] Vehicle state added
  - [ ] Vehicle tab added to navigation
  - [ ] Vehicle tab content added
  - [ ] CSS updated with vehicle button styles

## 🔧 Build & Run Instructions

### Setup Backend
```bash
# Navigate to backend
cd backend

# Run migrations
php artisan migrate

# Start Laravel server (if not using Docker)
php artisan serve
```

### Setup Frontend
```bash
# Navigate to frontend
cd frontend

# Run development server
npm run dev
```

### Using Docker
```bash
# From root directory
docker-compose up -d

# Run migrations
docker-compose exec laravel php artisan migrate
```

## 🧪 Testing Procedures

### 1. Test Vehicle Registration
```
Steps:
1. Login to admin dashboard
2. Click "🚗 Vehicles" tab
3. Click "✏️ Vehicle Management"
4. Fill form with vehicle details:
   - Number Plate: ABC-12345
   - Vehicle Type: Ambulance
   - Driver: John Doe
   - Contact: +92-3001234567
   - Hospital: Select hospital
   - Capacity: 2
5. Click "Register Vehicle"
6. Verify success message

Expected: Vehicle appears in list
```

### 2. Test Vehicle Tracking
```
Steps:
1. In "🚗 Vehicles" tab
2. Click "📍 Track Vehicle"
3. Enter number plate: ABC-12345
4. Click "Track"
5. Verify vehicle info displays
6. Check current location info

Expected: Vehicle details load, map displays (centered)
```

### 3. Test Search Functionality
```
Steps:
1. In VehicleTracking tab
2. Try different search queries:
   - Full number plate: "ABC-12345"
   - Driver name: "John"
   - Partial plate: "ABC"
3. Click search/Track button

Expected: Correct vehicles appear in results
```

### 4. Test Location Updates (Backend)
```bash
# Using cURL or Postman
POST /api/v1/vehicles/1/location
Headers: Authorization: Bearer TOKEN
Body:
{
  "latitude": 24.8607,
  "longitude": 67.0011,
  "speed": 45,
  "accuracy": 10,
  "address": "Karachi, Pakistan"
}

Expected Response:
{
  "success": true,
  "message": "Location updated successfully",
  "data": { location object }
}
```

### 5. Test Get Location History
```bash
GET /api/v1/vehicles/1/location/history?minutes=120
Headers: Authorization: Bearer TOKEN

Expected: Array of location records sorted by timestamp
```

### 6. Test Get All Vehicles with Filters
```bash
GET /api/v1/vehicles?status=active&per_page=15
Headers: Authorization: Bearer TOKEN

Expected: Paginated list of vehicles with relationships
```

## 🐛 Common Issues & Solutions

### Issue: Database Migration Failed
**Solution:**
```bash
# Check if migrations already exist
php artisan migrate:status

# If already migrated, run:
php artisan migrate:refresh --step

# Or manually roll back:
php artisan migrate:rollback
```

### Issue: Import Errors in AdminDashboard
**Solution:**
- Verify file paths match exactly (case-sensitive on Linux/Mac)
- Check that components are exported correctly as default
- Verify TypeScript compilation has no errors

### Issue: Map Not Displaying
**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Verify Leaflet CDN is loaded
4. Check if element with id="tracking-map" exists
5. Clear browser cache and reload

### Issue: Location Update Returns 404
**Solution:**
- Verify vehicle exists: `GET /api/v1/vehicles/{id}`
- Check authentication token is valid
- Verify vehicle_id in URL matches actual vehicle

### Issue: Search Returns No Results
**Solution:**
- Verify vehicle number plate format matches exactly
- Check database has vehicle registered
- Try searching by driver name instead

## 📊 API Response Examples

### Successful Vehicle Registration
```json
{
  "success": true,
  "message": "Vehicle registered successfully",
  "data": {
    "id": 1,
    "number_plate": "ABC-12345",
    "vehicle_type": "ambulance",
    "driver_name": "John Doe",
    "driver_contact": "+92-3001234567",
    "hospital_id": 1,
    "status": "inactive",
    "capacity": 2,
    "registration_date": "2026-04-09T10:30:00Z",
    "created_at": "2026-04-09T10:30:00Z",
    "updated_at": "2026-04-09T10:30:00Z"
  }
}
```

### Successful Location Update
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": 1,
    "vehicle_id": 1,
    "latitude": 24.8607,
    "longitude": 67.0011,
    "speed": 45.5,
    "accuracy": 10,
    "address": "Karachi, Pakistan",
    "timestamp": "2026-04-09T10:35:00Z",
    "created_at": "2026-04-09T10:35:00Z"
  }
}
```

### Location History Response
```json
{
  "success": true,
  "data": {
    "vehicle": { vehicle object },
    "locations": [
      { location object 1 },
      { location object 2 }
    ],
    "location_count": 150
  }
}
```

## 🎯 Verification Checklist

After deployment, verify:
- [ ] Admin can register a vehicle
- [ ] Vehicle appears in list
- [ ] Vehicle can be searched by number plate
- [ ] Vehicle can be deleted
- [ ] Location tracking page opens
- [ ] Map displays locations
- [ ] Route polyline shows correctly
- [ ] Start/end markers display
- [ ] Vehicle info populates
- [ ] Search returns correct vehicle
- [ ] No console JavaScript errors
- [ ] API responses are correct format

## 📱 Admin Dashboard Integration

### Navigation
```
Admin Dashboard
├── 📊 Overview
├── 👥 Users
├── 💊 Medicines
├── 🚚 Deliveries
├── 📦 Inventory
├── 🏥 Hospitals
└── 🚗 Vehicles ← NEW TAB
    ├── ✏️ Vehicle Management (Register/List)
    └── 📍 Track Vehicle (Real-time tracking)
```

## 💾 Database Backup

Before deploying to production:
```bash
# Backup current database
mysqldump -u root -p medicine_tracking > backup_$(date +%Y%m%d_%H%M%S).sql

# For PostgreSQL
pg_dump -U postgres medicine_tracking > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🚀 Production Deployment

1. Test in development environment ✓
2. Create database backup ✓
3. Run migrations on production ✓
4. Build frontend production bundle ✓
5. Deploy to server ✓
6. Run smoke tests ✓
7. Monitor logs for errors ✓
8. Document any issues ✓

## 📞 Support Resources

- **Documentation:** See `VEHICLE_TRACKING_GUIDE.md`
- **API Documentation:** Postman collection can be imported
- **Frontend Package Info:** `npm list react leaflet`
- **Backend Dependencies:** `composer show`

---

**Date Created:** April 9, 2026
**Status:** Ready for Testing
**Version:** 1.0
