# InsurePro Frontend Setup Guide

## Prerequisites
- Node.js 14+ installed
- npm installed
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create/update `.env.local` file in the frontend root:

```dotenv
# Supabase Configuration (get from Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Backend API Configuration (must match your backend PORT)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start the Frontend

```bash
npm run dev
```

The application will start on `http://localhost:3000`

### 4. Login Credentials

#### Default Test Users:
- **Admin User**
  - Email: admin@insurepro.com
  - Password: password

- **Agent User** (can add customers and create policies)
  - Email: agent@insurepro.com
  - Password: password

- **Customer User**
  - Email: customer@insurepro.com
  - Password: password

**Note**: If users don't exist, you need to create them in Supabase > Table Editor > profiles

### 5. User Roles

The application has 3 main roles:

1. **Admin** - Full access to all features
   - View all customers, policies, and claims
   - Create agents
   - View audit logs

2. **Insurance Agent** - Can manage assigned customers
   - **Add new customers** - Assign to their portfolio
   - **Create policies** - For their customers
   - View their customers and policies
   - Submit claims

3. **Customer** - Can view personal data
   - View own profile
   - View own policies
   - Submit claims

## Features by Role

### Agent Features (Can Add Customers & Policies)

#### Add Customer
1. Go to **Agent Portal** > **Customers**
2. Click **"Add Customer"** button
3. Fill in:
   - Full Name
   - Email Address
   - Phone Number
   - City
   - Customer Tier (Gold, Silver, Bronze)
4. Click **"Save Customer"**

#### Create Policy
1. Go to **Agent Portal** > **Customers**
2. Find customer and click **"Create Policy"**
3. Fill in:
   - Policy Type (Health, Life, Vehicle, Home, Travel, Disability)
   - Plan Name
   - Premium Amount
   - Coverage Amount
   - Start Date
   - End Date
4. Click **"Create Policy"**

## API Integration

The frontend communicates with the backend via:
- **API Base URL**: `http://localhost:5000/api`
- **Auth**: Supabase JWT tokens sent in Authorization header
- **Format**: JSON

Example API call:
```javascript
const response = await api.post('/customers', {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  city: 'New York',
  tier: 'Gold'
});
```

## Available Pages

### Public Pages
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset
- `/reset-password` - Reset password with token

### Agent Pages
- `/agent/dashboard` - Agent overview
- `/agent/customers` - Customer management
- `/agent/customers/{id}` - Customer details
- `/agent/claims` - Claims management
- `/agent/profile` - Agent profile

### Admin Pages
- `/admin/dashboard` - Admin dashboard
- `/admin/customers` - All customers
- `/admin/policies` - All policies
- `/admin/claims` - All claims
- `/admin/agents` - Agent management
- `/admin/payments` - Payment records
- `/admin/reports` - Reports and analytics
- `/admin/audit-logs` - Audit logs

### Customer Pages
- `/customer/dashboard` - Personal dashboard
- `/customer/policies` - My policies
- `/customer/claims` - My claims
- `/customer/documents` - My documents
- `/customer/premiums` - My premiums
- `/customer/profile` - My profile

## Troubleshooting

### "Network Error" when adding customer
1. **Check backend is running**:
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"success":true,"message":"InsurePro API is running",...}`

2. **Check environment variables** in `.env.local`:
   - NEXT_PUBLIC_API_URL should be `http://localhost:5000/api`
   - NEXT_PUBLIC_SUPABASE_URL should match your Supabase project URL

3. **Check browser console** (F12) for detailed error:
   - Network tab to see if request is being sent
   - Console tab for JavaScript errors

### "401 Unauthorized" when accessing protected routes
- Your session might have expired
- Try logging out and logging back in
- Check that you have the correct role for that page

### Cannot login
- Make sure user exists in Supabase > Table Editor > profiles
- Verify email is correct
- Make sure Supabase authentication is configured

### Components not loading
- Check that all dependencies are installed: `npm install`
- Try clearing Next.js cache: `rm -rf .next`
- Rebuild: `npm run dev`

## Build for Production

```bash
npm run build
npm start
```

## Environment Check

To verify your setup is correct:
1. Backend should be running on port 5000
2. Frontend should be running on port 3000
3. Supabase project should be accessible
4. Database schema should be created in Supabase
