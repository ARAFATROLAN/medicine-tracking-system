# 🏥 Admin Dashboard - Implementation Guide

## 📋 Overview

This guide covers the complete admin dashboard implementation for the Medicine Tracking System. The dashboard provides real-time system monitoring, user management, inventory tracking, and delivery management capabilities.

---

## ✨ Features Implemented

### 1. **Dashboard Overview**
- Real-time statistics (users, medicines, prescriptions, deliveries)
- System health monitoring (database, API, disk, memory)
- Critical alerts section (low stock, expired medicines, pending approvals)
- Recent activity feed with timestamps
- Auto-refresh every 5 seconds

### 2. **User Management**
- View all users with pagination
- Edit user details
- Delete users with confirmation
- Track user roles and specializations
- Activity logging for all user operations

### 3. **Inventory Management**
- Real-time inventory levels
- Stock status indicators (critical, low, adequate)
- Expiry date tracking
- Location management
- Update inventory quantities

### 4. **Delivery Management**
- View all deliveries with status filtering
- Approve/reject pending transfers
- Track delivery status changes
- Add notes to deliveries
- Real-time status updates

### 5. **Medicine Management**
- View complete medicine inventory
- Track stock levels and expiry dates
- Update medicine details
- Color-coded stock status indicators
- Expiry alerts

### 6. **System Monitoring**
- Database health status
- API availability monitoring
- Disk usage percentage
- Memory usage tracking
- Real-time system metrics

### 7. **Real-time Auto-Updates**
- Configurable polling interval (default: 5 seconds)
- Smart polling with error handling
- Automatic cleanup on unmount
- Graceful degradation on API errors
- Session persistence

---

## 🔧 Backend Setup

### DashboardController Enhancements

The backend `DashboardController` now includes comprehensive endpoints:

```
GET  /dashboard                    - Overall statistics
GET  /dashboard/system-health      - System health metrics
GET  /dashboard/users              - Users list (paginated)
GET  /dashboard/users/{id}         - User details
PUT  /dashboard/users/{id}         - Update user
DELETE /dashboard/users/{id}       - Delete user
GET  /dashboard/medicines          - Medicines list
PUT  /dashboard/medicines/{id}     - Update medicine
GET  /dashboard/deliveries         - Deliveries list with filtering
PUT  /dashboard/deliveries/{id}/status - Update delivery status
GET  /dashboard/inventory          - Inventory items
PUT  /dashboard/inventory/{id}     - Update inventory
GET  /dashboard/activity-logs      - Activity logs
GET  /dashboard/notifications      - Notifications
PUT  /dashboard/notifications/{id}/read - Mark as read
GET  /dashboard/reports            - Analytics reports
GET  /dashboard/hospitals          - Hospital information
GET  /dashboard/settings           - System settings
```

### API Routes

All endpoints are protected by `auth:sanctum` middleware and grouped under `/api/v1/dashboard`.

---

## 🎨 Frontend Components

### Main AdminDashboard Component
Located at: `src/pages/AdminDashboard.tsx`

**Key Features:**
- Tabbed interface for different sections
- Real-time data fetching with auto-refresh
- Error handling and loading states
- Responsive design (mobile, tablet, desktop)
- Sidebar navigation

**Sub-Components:**
1. **MetricCard** - KPI cards with icons and values
2. **HealthCard** - System health status display
3. **ProgressCard** - Performance metrics with progress bars
4. **UsersManagement** - User CRUD operations
5. **MedicinesManagement** - Medicine inventory view
6. **DeliveriesManagement** - Delivery approval system
7. **InventoryManagement** - Stock level tracking

### API Service
Located at: `src/Services/api.ts`

Enhanced with methods for:
- Dashboard statistics
- User CRUD operations
- Medicine management
- Delivery management
- Inventory updates
- Activity logs
- Notifications
- Reports and analytics

### Custom Hooks
Located at: `src/hooks/useAutoRefresh.ts`

**Hooks Provided:**
1. **useAutoRefresh** - Single data source polling
   ```typescript
   const { data, loading, error, refetch } = useAutoRefresh(
     () => api.fetchDashboardStats(),
     { interval: 5000 }
   );
   ```

2. **useMultiAutoRefresh** - Multiple data sources in parallel
   ```typescript
   const { data, loading, error } = useMultiAutoRefresh({
     stats: () => api.fetchDashboardStats(),
     health: () => api.fetchSystemHealth(),
   });
   ```

3. **useDataChange** - Detect data changes
   ```typescript
   useDataChange(data, (newData, oldData) => {
     console.log("Data changed!");
   });
   ```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+
- PHP 8.0+
- Laravel 9+
- MySQL/PostgreSQL

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   composer install
   ```

2. **Configure database:**
   ```bash
   cp .env.example .env
   # Edit .env with database credentials
   php artisan key:generate
   php artisan migrate
   ```

3. **Run migrations (if not done):**
   ```bash
   php artisan migrate:fresh --seed
   ```

4. **Start the Laravel server:**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Update API URL if needed:**
   Edit `src/Services/api.ts`:
   ```typescript
   const baseURL: string = "http://localhost:8000/api/v1";
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the dashboard:**
   - Navigate to: `http://localhost:5173/admin` (or your configured port)
   - Default credentials: Use your registered admin account

---

## 📊 Data Flow

### Real-time Update Cycle

```
┌─────────────────────────────────────────┐
│  Component Mounts (AdminDashboard)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  useAutoRefresh Hook Initializes        │
│  - Initial fetch triggered              │
│  - Polling interval started (5s)        │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  API Call    │
        │  (Parallel)  │
        └──────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   ┌─────────┐  ┌──────────┐
   │ Stats   │  │ Health   │
   └────┬────┘  └────┬─────┘
        │            │
        └──────┬─────┘
               ▼
    ┌─────────────────────┐
    │  State Update       │
    │  - setStats()       │
    │  - setHealth()      │
    │  - setError(null)   │
    └──────────────┬──────┘
                   │
                   ▼
    ┌──────────────────────┐
    │ Component Re-renders │
    │ with New Data        │
    └──────────┬───────────┘
               │
               ▼ (Every 5 seconds)
        ┌──────────────┐
        │  Repeat      │
        └──────────────┘
```

---

## 🔐 Security Features

1. **Authentication**
   - Sanctum token-based auth
   - Automatic token refresh
   - Session validation on every request

2. **Authorization**
   - Admin role verification
   - Activity logging for all admin operations
   - Audit trail tracking

3. **Data Validation**
   - Input validation on all endpoints
   - Sanitization of user inputs
   - CORS protection

---

## 🎯 Usage Examples

### Fetching Dashboard Data

```typescript
// Single source
const { data, loading, error } = useAutoRefresh(
  () => api.fetchDashboardStats(),
  { interval: 5000, enabled: true }
);

// Multiple sources
const { data } = useMultiAutoRefresh({
  statistics: () => api.fetchDashboardStats(),
  health: () => api.fetchSystemHealth(),
  users: () => api.fetchUsers(),
}, { interval: 5000 });
```

### Managing Users

```typescript
// Update user
const response = await api.updateUser(userId, {
  name: "New Name",
  email: "new@email.com",
});

// Delete user
await api.deleteUser(userId);
```

### Managing Deliveries

```typescript
// Update delivery status
const response = await api.updateDeliveryStatus(
  deliveryId,
  "approved",
  "Approved for shipment"
);

// Fetch filtered deliveries
const pending = await api.fetchDeliveries(1, "pending");
```

---

## 🐛 Troubleshooting

### Issue: Dashboard not loading
**Solution:**
- Check if backend server is running on port 8000
- Verify API URL in `src/Services/api.ts`
- Check browser console for CORS errors
- Ensure authentication token is valid

### Issue: 401 Unauthorized errors
**Solution:**
- Clear localStorage and re-login
- Check token expiration
- Verify Sanctum configuration in `config/sanctum.php`

### Issue: Slow data loading
**Solution:**
- Check database query performance
- Adjust polling interval if necessary
- Check network tab in browser DevTools
- Review Laravel logs for errors

### Issue: Real-time updates not working
**Solution:**
- Verify useAutoRefresh hook is properly initialized
- Check if `enabled` prop is true
- Review browser console for network errors
- Check API response structure matches expected format

---

## 📈 Performance Optimization

### Current Implementation
- Polling interval: 5 seconds (configurable)
- Parallel API calls for multiple data sources
- Component memoization
- Error boundaries

### Future Enhancements
1. **WebSocket Support**
   ```typescript
   // Next version: Real-time updates via WebSocket
   const { data } = useWebSocketRefresh(
     'wss://api.example.com/socket',
     { events: ['stats', 'health'] }
   );
   ```

2. **Server-Sent Events (SSE)**
   ```typescript
   // Alternative: SSE for unidirectional updates
   const eventSource = new EventSource('/api/dashboard/stream');
   ```

3. **Data Caching**
   - Implement Redis caching on backend
   - Client-side caching with Service Workers
   - Cache invalidation strategies

4. **Pagination & Filtering**
   - Virtual scrolling for large datasets
   - Server-side filtering
   - Advanced search capabilities

---

## 📝 Activity Logging

All admin operations are logged with:
- Admin user ID
- Action description
- Model type and ID
- Timestamp
- Results

**Viewable at:** Dashboard → Activity Logs tab

---

## 🔄 Database Migrations

Required migrations are already in place:
- `create_users_table`
- `create_medicines_table`
- `create_medicine_inventory_table`
- `create_prescriptions_table`
- `create_deliveries_table`
- `create_activity_logs_table`
- `create_notifications_table`

Run: `php artisan migrate`

---

## 📞 Support & Next Steps

### Recommended Enhancements
1. Add chart visualizations (Charts.js, React Chart)
2. Implement WebSocket for true real-time updates
3. Add export to CSV/PDF functionality
4. Role-based dashboard customization
5. Advanced analytics and reporting
6. Mobile app version

### Integration Points
- Payment gateway integration
- Email notifications
- SMS alerts
- Third-party analytics
- Data backup services

---

## 📄 License

This implementation is part of the Medicine Tracking System project.

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
