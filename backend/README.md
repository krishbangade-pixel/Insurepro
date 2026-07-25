# InsurePro Backend API

Express API for the InsurePro Next.js frontend. Authentication is provided by Supabase Auth; this API verifies the Supabase access token sent by the frontend.

## Features

- Supabase Auth access-token verification
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
copy .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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

The frontend signs users in, registers users, and resets passwords through Supabase Auth. Every protected API request includes the Supabase access token as a Bearer token; `src/middleware/auth.js` verifies it and reads the user’s role from `profiles`.

## Middleware

### auth
Verifies the Supabase token and attaches the authenticated user to `req.user`.

### roleMiddleware(...allowedRoles)
Checks if user has required role

**Usage:**
```javascript
router.get('/admin', auth, roleCheck('Admin'), controller);
```

## Database Schema

Supabase owns the `auth.users` table. Application-specific identity data, including roles, is stored in `profiles`; the remaining business tables are defined in `src/database/schema.sql`.

## Security Features

- Supabase manages passwords, sessions, and refresh tokens
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
- Add the Service Role key only to `backend/.env`; never expose it in the frontend.
