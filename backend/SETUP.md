# InsurePro Backend Setup Guide

## Prerequisites
- Node.js 14+ installed
- npm installed
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Update `.env` file with your Supabase credentials:

```dotenv
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
# Get these from Supabase > Project Settings > API
SUPABASE_URL=https://your-project-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase

# CORS Configuration  
CORS_ORIGIN=http://localhost:3000
```

### 3. Setup Supabase Database

1. Go to your Supabase project dashboard
2. Go to SQL Editor
3. Create a new query and copy-paste the entire contents of `backend/database/schema.sql`
4. Execute the query to create all tables, functions, and RLS policies

### 4. Get Your Supabase Credentials

1. Go to **Project Settings** > **API**
2. Copy the **Project URL** (this is your SUPABASE_URL)
3. Copy the **Service Role Secret** (this is your SUPABASE_SERVICE_ROLE_KEY)
4. Get your **Anon Public Key** for the frontend

### 5. Start the Backend Server

```bash
# Development with auto-reload
npm run dev

# Or production
npm start
```

The server will start on `http://localhost:5000`

You should see:
```
🚀 InsurePro API running on port 5000
📋 Environment: development
💚 Health check: http://localhost:5000/health
```

### 6. Verify Backend is Running

Visit in your browser or curl:
```bash
curl http://localhost:5000/health
```

You should get:
```json
{
  "success": true,
  "message": "InsurePro API is running",
  "timestamp": "2026-07-27T..."
}
```

## API Routes

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Customers**: `GET /api/customers`, `POST /api/customers`, `GET /api/customers/:id`, `PUT /api/customers/:id`
- **Policies**: `GET /api/policies`, `POST /api/policies`, `GET /api/policies/:id`, `PUT /api/policies/:id`
- **Claims**: `GET /api/claims`, `POST /api/claims`, `PUT /api/claims/:id`
- **Payments**: `GET /api/payments`, `POST /api/payments`
- **Reports**: `GET /api/reports/dashboard`, `GET /api/reports/revenue`
- **Agents**: `GET /api/agents`, `POST /api/agents`

## Troubleshooting

### "Network Error" when adding customer
1. Check that backend is running on port 5000
2. Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
3. Check CORS_ORIGIN matches your frontend URL
4. Check browser console for actual error message

### 401 Unauthorized
- Your Supabase token is invalid or expired
- Try logging in again
- Check that your SUPABASE_SERVICE_ROLE_KEY is correct

### 500 Internal Server Error
- Check server logs for the error message
- Ensure the database schema is properly set up in Supabase
- Verify all environment variables are set

## Database Schema

The schema includes:
- **profiles** - User profiles (linked to Supabase auth)
- **agents** - Insurance agents
- **customers** - Customer records
- **policies** - Insurance policies
- **policy_types** - Types of policies
- **claims** - Insurance claims
- **premium_payments** - Payment records
- **documents** - Customer documents
- **notifications** - User notifications
- **audit_logs** - Audit trail

All tables have Row Level Security (RLS) enabled based on user roles.

## Development

### Run Tests
```bash
npm test
```

### Format Code
```bash
npm run prettier
```

### Lint Code
```bash
npm run lint
```
