# 🚀 Medicine Tracking System - Quick Start Guide

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **PHP**: v8.0 or higher
- **Composer**: Latest version
- **MySQL/PostgreSQL**: Any recent version
- **Docker** (Optional, for Docker Compose setup)
- **Git**: For version control

---

## 🎯 Quick Setup (5 Minutes)

### Option 1: Using Docker Compose (Recommended)

1. **Navigate to project root:**
   ```bash
   cd medicine-tracking-system
   ```

2. **Start containers:**
   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Setup database:**
   ```bash
   docker-compose exec app php artisan migrate --seed
   ```

4. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - PhpMyAdmin: `http://localhost:8080` (if using Docker)

---

### Option 2: Manual Setup (Local Development)

#### Step 1: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure database in .env
# Update these lines:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=medicine_tracking
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations and seeders
php artisan migrate:fresh --seed

# Start Laravel server
php artisan serve
# Server runs on http://localhost:8000
```

#### Step 2: Frontend Setup

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

#### Step 3: Access the Dashboard

1. **Login:**
   - URL: `http://localhost:5173`
   - Email: Try any admin account from seeds
   - Or register a new account

2. **Access Admin Dashboard:**
   - URL: `http://localhost:5173/admin`
   - View: Real-time statistics, user management, inventory

---

## 🔐 Default Admin Credentials

After running seeders, use these credentials:

```
Email: admin@hospital.com
Password: password123
Role: Admin
```

**⚠️ Change these immediately in production!**

---

## 📁 Project Structure

```
medicine-tracking-system/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/   # API Controllers
│   │   ├── Models/             # Database Models
│   │   └── Mail/               # Email Templates
│   ├── database/
│   │   ├── migrations/         # Database Schemas
│   │   └── seeders/            # Test Data
│   ├── routes/
│   │   ├── api.php             # API Routes
│   │   └── web.php             # Web Routes
│   ├── config/                 # Configuration Files
│   ├── .env                    # Environment Settings
│   ├── artisan                 # Laravel CLI
│   └── composer.json           # PHP Dependencies
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/         # React Components
│   │   ├── pages/              # Page Components
│   │   ├── Services/           # API Services
│   │   ├── hooks/              # Custom Hooks
│   │   ├── context/            # Context API
│   │   └── App.tsx             # Main Component
│   ├── public/                 # Static Files
│   ├── package.json            # Node Dependencies
│   ├── tsconfig.json           # TypeScript Config
│   └── vite.config.ts          # Vite Config
│
├── ADMIN_DASHBOARD_GUIDE.md    # Dashboard Documentation
├── docker-compose.yml          # Docker Configuration
├── Dockerfile                  # Docker Image
└── README.md                   # Project Overview
```

---

## 🛠️ Common Commands

### Backend (Laravel)

```bash
# Database operations
php artisan migrate              # Run migrations
php artisan migrate:rollback     # Undo migrations
php artisan migrate:refresh      # Refresh database
php artisan migrate:fresh --seed # Fresh install with seeds

# Queue operations
php artisan queue:work             # Start queue worker
php artisan queue:failed           # View failed jobs

# Cache operations
php artisan cache:clear           # Clear cache
php artisan config:cache          # Cache configuration

# Development
php artisan serve                 # Start server
php artisan tinker                # Interactive shell
php artisan make:model ModelName  # Create new model
php artisan make:controller ControllerName # Create controller
php artisan make:migration create_table_name # Create migration
```

### Frontend (React + Vite)

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run lint                   # Run ESLint

# Dependencies
npm install                    # Install packages
npm update                     # Update packages
npm audit                      # Check vulnerabilities
```

---

## 🗄️ Database Schema Overview

### Key Tables

**Users Table**
- Stores all user accounts
- Roles: Admin, Doctor, Pharmacist, Patient

**Medicines Table**
- Medicine inventory master data
- Tracks expiry dates, descriptions

**Prescriptions Table**
- Doctor prescriptions for patients
- Links medicines and patients

**Deliveries Table**
- Medicine delivery tracking
- Status: Pending, Approved, Completed, Rejected

**Activity Logs Table**
- Audit trail of all admin operations
- Tracks who did what and when

**Notifications Table**
- System notifications for users
- Real-time alerts

---

## 🔌 API Endpoints

### Authentication Endpoints
```
POST   /api/v1/register              - Register new user
POST   /api/v1/login                 - Login user
```

### Admin Dashboard Endpoints
```
GET    /api/v1/dashboard             - Overall statistics
GET    /api/v1/dashboard/users       - User list
GET    /api/v1/dashboard/medicines   - Medicine list
GET    /api/v1/dashboard/deliveries  - Delivery list
GET    /api/v1/dashboard/inventory   - Inventory items
GET    /api/v1/dashboard/system-health - System metrics
GET    /api/v1/dashboard/activity-logs - Admin activity
GET    /api/v1/dashboard/reports     - Analytics data
```

**All admin endpoints require:**
- Authentication token (Sanctum)
- Admin role verification

---

## 🔄 Real-time Features

### Auto-Refresh Configuration

Edit `src/pages/AdminDashboard.tsx`:

```typescript
// Change refresh interval (milliseconds)
const interval = setInterval(fetchData, 5000); // 5 seconds

// Or use the hook:
const { data } = useAutoRefresh(
  () => api.fetchDashboardStats(),
  { interval: 3000 } // 3 seconds
);
```

---

## 📊 Admin Dashboard Features

### Overview Tab
- Real-time KPIs
- System health monitoring
- Critical alerts
- Recent activity feed

### Users Tab
- View all users
- Edit user details
- Delete users
- Track user roles

### Medicines Tab
- Inventory status
- Expiry tracking
- Stock levels
- Update details

### Deliveries Tab
- View pending transfers
- Approve/reject deliveries
- Update status
- Track history

### Inventory Tab
- Stock quantities
- Location tracking
- Expiry dates
- Quick updates

---

## 🚨 Troubleshooting

### Backend Won't Start

**Error: SQLSTATE[HY000]**
```bash
# Solution: Check .env database config
cd backend
php artisan migrate:fresh --seed  # Reset database
```

**Error: Composer dependencies**
```bash
composer install
composer update
```

### Frontend Won't Load

**Error: Cannot find module**
```bash
cd frontend
npm install
npm cache clean --force
npm install
```

**Error: Port 5173 in use**
```bash
npm run dev -- --port 3000  # Use different port
```

### API Connection Issues

**Error: 401 Unauthorized**
- Check authentication token in localStorage
- Re-login to get new token
- Check `Authorization` header in network tab

**Error: CORS issues**
- Verify `config/cors.php` in Laravel
- Check frontend API URL in `src/Services/api.ts`

---

## 📝 Environment Configuration

### Backend `.env` File

```env
APP_NAME="Medicine Tracking System"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medicine_tracking
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=system@hospital.com

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

### Frontend Configuration

Edit `src/Services/api.ts`:

```typescript
const baseURL: string = "http://localhost:8000/api/v1";
```

---

## 🚀 Production Deployment

### Backend (Production)

```bash
# Build for production
npm run build  # frontend
php artisan optimize  # backend

# Database
php artisan migrate --env=production
php artisan config:cache
php artisan route:cache

# Start with supervisor:
# Edit /etc/supervisor/conf.d/laravel.conf
program:laravel-queue
command=php /path/to/artisan queue:work
autostart=true
autorestart=true
```

### Frontend (Production)

```bash
# Build
npm run build

# Deploy dist/ folder to your server
# Configure web server (Nginx/Apache) to serve from dist/
```

### Environment Variables for Production

```env
APP_ENV=production
APP_DEBUG=false
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_SECURE_COOKIES=true
```

---

## 📞 Support & Resources

### Documentation Files
- `ADMIN_DASHBOARD_GUIDE.md` - Detailed dashboard guide
- `README.md` - Project overview
- `backend/README.md` - Backend setup
- `frontend/README.md` - Frontend setup

### Key Files to Know
- `backend/app/Http/Controllers/DashboardController.php` - Main dashboard logic
- `frontend/src/pages/AdminDashboard.tsx` - Dashboard component
- `frontend/src/Services/api.ts` - API service layer
- `backend/routes/api.php` - API endpoint definitions

### Getting Help
1. Check the logs:
   - Backend: `backend/storage/logs/laravel.log`
   - Frontend: Browser console (F12)

2. Test API endpoints:
   - Use Postman or Insomnia
   - Test at: `http://localhost:8000/api/v1/ping`

3. Database debugging:
   - Use PhpMyAdmin (if Docker)
   - Check migrations ran successfully

---

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Database connected and migrated
- [ ] Admin account created
- [ ] Login successful
- [ ] Dashboard loads with data
- [ ] Real-time updates working
- [ ] No console errors

---

## 🎓 Next Steps

1. **Customize settings** - Adjust polling intervals, thresholds
2. **Add webhooks** - For external system integration
3. **Setup monitoring** - Configure error tracking
4. **Performance tuning** - Optimize database queries
5. **Mobile app** - Build React Native version
6. **Analytics** - Integrate data visualization tools

---

## 📄 License

Part of the Medicine Tracking System project.

---

**Last Updated:** March 26, 2026
**Quick Start Version:** 1.0
**Status:** ✅ Ready for Use
