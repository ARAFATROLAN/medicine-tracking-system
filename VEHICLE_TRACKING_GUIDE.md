# Vehicle Tracking System - Implementation Guide

## Overview
A complete real-time vehicle tracking system with geo-mapping capabilities has been integrated into your medicine tracking system. This system allows admins to register vehicles, track their real-time location, search by number plate, and monitor deliveries in transit.

## Features Implemented

### 1. **Vehicle Management**
- Register new vehicles with unique number plates
- Track vehicle details (driver name, contact, vehicle type, capacity)
- Manage vehicle status (active, inactive, maintenance, in_transit)
- View all registered vehicles with filters
- Delete vehicles

### 2. **Real-Time Tracking**
- Real-time GPS location updates
- Historic location trail visualization
- Search vehicles by number plate
- Current location with speed, accuracy, and address
- Route distance calculation
- Track vehicles for specific time periods

### 3. **Map Integration**
- Interactive Leaflet maps with OpenStreetMap
- Real-time vehicle position markers
- Route polylines showing the path taken
- Vehicle information popups
- Automatic map centering on search

## Database Schema

### `vehicles` Table
```sql
- id (Primary Key)
- number_plate (UNIQUE, INDEX)
- vehicle_type
- driver_name
- driver_contact
- hospital_id (Foreign Key)
- status (ENUM: active, inactive, maintenance, in_transit)
- capacity
- registration_date
- last_location_update
- timestamps
```

### `vehicle_locations` Table
```sql
- id (Primary Key)
- vehicle_id (Foreign Key)
- latitude (Decimal)
- longitude (Decimal)
- accuracy (meters)
- speed (km/h)
- heading (degrees)
- altitude (meters)
- timestamp
- address
- timestamps
- Indexes: vehicle_id + timestamp, timestamp
```

### `deliveries` Table (Modified)
- Added: vehicle_id (Foreign Key, nullable)

## API Endpoints

### Vehicle Management
```
POST   /api/v1/vehicles/register          - Register new vehicle
GET    /api/v1/vehicles                   - Get all vehicles (with filters)
GET    /api/v1/vehicles/{id}              - Get vehicle by ID
GET    /api/v1/vehicles/number-plate/{np} - Get vehicle by number plate
PUT    /api/v1/vehicles/{id}              - Update vehicle details
DELETE /api/v1/vehicles/{id}              - Delete vehicle
GET    /api/v1/vehicles/in-transit        - Get vehicles in transit
GET    /api/v1/vehicles/search?q=xyz      - Search vehicles
```

### Location Tracking
```
POST   /api/v1/vehicles/{id}/location           - Update vehicle location
GET    /api/v1/vehicles/{id}/location/current   - Get current location
GET    /api/v1/vehicles/{id}/location/history   - Get location history
```

## Frontend Components

### 1. **VehicleRegistration Component**
Location: `frontend/src/pages/Admin/VehicleRegistration.tsx`

**Features:**
- Form to register new vehicles
- Hospital selection dropdown
- Vehicle list with management options
- Tabs for registration and vehicle listing
- Delete functionality

**Register a Vehicle:**
```
- Number Plate: ABC-12345 (Unique identifier)
- Vehicle Type: Ambulance/Truck/Van/Car
- Driver Name: Full name
- Driver Contact: Phone number
- Hospital: Select from dropdown
- Capacity: Units that can be carried
```

### 2. **VehicleTracking Component**
Location: `frontend/src/pages/Admin/VehicleTracking.tsx`

**Features:**
- Search vehicles by number plate
- Real-time map display
- Location history visualization
- Current location info (speed, accuracy, address)
- Route statistics (distance, positions)
- Real-time updates

**Track a Vehicle:**
1. Enter number plate in search box
2. Click "Track" button
3. View real-time map with vehicle position
4. See location history and route taken
5. Monitor current speed and accuracy

### 3. **VehicleAPI Service**
Location: `frontend/src/Services/vehicleAPI.ts`

Provides all API calls for vehicle operations.

## Backend Implementation

### Models
- **Vehicle** (`app/Models/Vehicle.php`)
- **VehicleLocation** (`app/Models/VehicleLocation.php`)

### Controller
- **VehicleController** (`app/Http/Controllers/VehicleController.php`)

All methods return JSON responses with success/error flags.

## Admin Dashboard Integration

### New Tab: 🚗 Vehicles
- Access from main admin dashboard navigation
- Two action buttons:
  1. **✏️ Vehicle Management** - Register and manage vehicles
  2. **📍 Track Vehicle** - Real-time tracking with map

## Setup Instructions

### 1. **Run Database Migrations**
```bash
cd backend
php artisan migrate
```

This will create:
- `vehicles` table
- `vehicle_locations` table
- Add `vehicle_id` column to `deliveries` table

### 2. **Frontend Dependencies**
The VehicleTracking component uses Leaflet.js from CDN (no additional npm install needed):
- Leaflet CSS: CDN loaded
- Leaflet JS: CDN loaded
- Uses OpenStreetMap for tiles

### 3. **Test the System**

#### Via Admin Dashboard:
1. Login as admin
2. Navigate to "🚗 Vehicles" tab
3. Click "✏️ Vehicle Management"
4. Register a test vehicle
5. Click "📍 Track Vehicle"
6. Search by number plate and track

#### Via API (Postman/cURL):

**Register Vehicle:**
```bash
curl -X POST http://localhost:8000/api/v1/vehicles/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "number_plate": "ABC-12345",
    "vehicle_type": "ambulance",
    "driver_name": "John Doe",
    "driver_contact": "+92-300-1234567",
    "hospital_id": 1,
    "capacity": 2
  }'
```

**Update Location:**
```bash
curl -X POST http://localhost:8000/api/v1/vehicles/1/location \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 24.8607,
    "longitude": 67.0011,
    "speed": 45,
    "accuracy": 10,
    "address": "Karachi, Pakistan"
  }'
```

**Get Current Location:**
```bash
curl -X GET http://localhost:8000/api/v1/vehicles/1/location/current \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Track History:**
```bash
curl -X GET "http://localhost:8000/api/v1/vehicles/1/location/history?minutes=120" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Real-Time Updates Architecture

### How Location Updates Work:
1. Mobile/GPS device sends location to API
2. VehicleController stores in `vehicle_locations` table
3. Updates `last_location_update` in vehicles table
4. Frontend polls API for updates (configurable interval)
5. Map refreshes with new position

### For Production WebSocket Implementation:
To implement real-time WebSocket updates instead of polling:

1. Install Laravel WebSocket package:
```bash
composer require beyondcode/laravel-websockets
```

2. Create WebSocket event for location updates

3. Update VehicleTracking frontend component to use WebSocket

## File Structure

```
backend/
├── app/
│   ├── Models/
│   │   ├── Vehicle.php
│   │   └── VehicleLocation.php
│   └── Http/Controllers/
│       └── VehicleController.php
├── database/migrations/
│   ├── 2026_04_09_100000_create_vehicles_table.php
│   ├── 2026_04_09_100100_create_vehicle_locations_table.php
│   └── 2026_04_09_100200_add_vehicle_id_to_deliveries_table.php
└── routes/api.php (updated)

frontend/
├── src/
│   ├── Services/
│   │   └── vehicleAPI.ts
│   └── pages/
│       ├── AdminDashboard.tsx (updated)
│       ├── AdminDashboard.css (updated)
│       └── Admin/
│           ├── VehicleRegistration.tsx
│           ├── VehicleRegistration.css
│           ├── VehicleTracking.tsx
│           └── VehicleTracking.css
```

## Security Considerations

1. **Authentication:** All vehicle endpoints require Sanctum bearer token
2. **Authorization:** Only admins can access vehicle management
3. **Data Validation:** All inputs validated server-side
4. **SQL Injection:** Protected using Laravel's query builder
5. **CORS:** Configured in your existing CORS middleware

## Performance Optimization

1. **Indexes:** Created on frequently searched columns
   - `vehicles.number_plate`
   - `vehicles.hospital_id, status`
   - `vehicle_locations.vehicle_id, timestamp`

2. **Pagination:** Vehicle lists are paginated (15 per page)

3. **Location History:** Query filtered by time range (default 60 minutes)

4. **Map Rendering:** Only recent locations displayed

## Future Enhancement Ideas

1. **Geofencing:** Alert when vehicle exits specified boundaries
2. **Route Optimization:** AI-based optimal delivery routes
3. **Driver Notifications:** Real-time notifications for route changes
4. **Delivery Assignment:** Auto-assign deliveries to nearby vehicles
5. **Analytics Dashboard:** Delivery time, distance, efficiency metrics
6. **Mobile App:** Native mobile app for drivers to receive delivery orders
7. **Integration with Third-party Maps:** Google Maps, Mapbox
8. **Speed Alerts:** Notification if vehicle exceeds speed limit
9. **Maintenance Alerts:** Schedule maintenance based on distance traveled
10. **Vehicle Status Updates:** Fuel level, temperature, package count

## Troubleshooting

### Map not displaying?
- Check browser console for JavaScript errors
- Verify Leaflet CDN is accessible
- Check if HTML element with id="tracking-map" exists

### Location not updating?
- Verify API endpoint is accessible
- Check authentication token is valid
- Ensure vehicle_id is correct

### Search not working?
- Verify number plate format matches registered format
- Check API endpoint response in network tab
- Ensure vehicle exists in database

### Migration errors?
```bash
# Reset migrations if needed (CAUTION - deletes data)
php artisan migrate:reset
php artisan migrate
```

## Support & Documentation

For more information on:
- **Laravel:** https://laravel.com/docs
- **React:** https://react.dev
- **Leaflet Maps:** https://leafletjs.com
- **OpenStreetMap:** https://www.openstreetmap.org

---

## Summary

Your vehicle tracking system is now fully operational with:
✅ Vehicle registration and management
✅ Real-time GPS tracking with maps
✅ Search by number plate functionality
✅ Location history and route visualization
✅ Admin dashboard integration
✅ Complete API endpoints
✅ Production-ready code

The system is ready for deployment and can handle medicine transportation tracking across hospital branches with real-time visibility for administrators.
