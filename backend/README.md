# InsurePro Backend API

Custom JWT-based authentication system using Node.js, Express, and PostgreSQL (Supabase).

## Features

- JWT Authentication with HTTP-only cookies
- Password hashing with bcrypt
- Role-based authorization (Admin, Insurance Agent, Customer)
- Input validation with express-validator
- Secure password reset flow
- Rate limiting
- CORS support
- Helmet security headers

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase PostgreSQL database

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@host:port/database
CORS_ORIGIN=http://localhost:3000
```

4. Set up the database schema:
```bash
# Connect to your Supabase PostgreSQL database
# Run the SQL schema from src/database/schema.sql
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "gender": "Male",
  "role": "Customer",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

#### POST /api/auth/login
Login user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:** Sets HTTP-only cookie with JWT token

#### POST /api/auth/logout
Logout user (requires authentication)

#### GET /api/auth/me
Get current user (requires authentication)

#### POST /api/auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "reset-token-here",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

## Middleware

### authMiddleware
Verifies JWT token and attaches user to `req.user`

### roleMiddleware(...allowedRoles)
Checks if user has required role

**Usage:**
```javascript
router.get('/admin', authMiddleware, roleMiddleware('Admin'), controller);
```

## Database Schema

### Users Table
- `id` (UUID, primary key)
- `full_name` (VARCHAR)
- `email` (VARCHAR, unique)
- `password` (VARCHAR, hashed)
- `gender` (VARCHAR: Male/Female)
- `role` (VARCHAR: Customer/Insurance Agent/Admin)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Password Reset Tokens Table
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `token` (VARCHAR)
- `expires_at` (TIMESTAMP)
- `used` (BOOLEAN)
- `created_at` (TIMESTAMP)

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with configurable expiration
- HTTP-only cookies for token storage
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (parameterized queries)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # PostgreSQL connection
│   │   └── index.js         # App configuration
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT verification
│   │   └── roleMiddleware.js # Role-based access
│   ├── models/
│   │   ├── User.js          # User model
│   │   └── PasswordResetToken.js # Reset token model
│   ├── routes/
│   │   └── authRoutes.js    # API routes
│   ├── services/
│   │   └── authService.js  # Business logic
│   ├── utils/
│   │   ├── generateToken.js # JWT utilities
│   │   └── hashPassword.js  # Password hashing
│   ├── validations/
│   │   └── authValidation.js # Input validation
│   ├── database/
│   │   └── schema.sql       # Database schema
│   └── server.js            # Entry point
├── .env                     # Environment variables
├── package.json
└── README.md
```

## Development Notes

- The backend runs on port 5000 by default
- JWT secret must be at least 32 characters in production
- Database URL should be obtained from Supabase project settings
- In development, reset tokens are returned in response (remove in production)
