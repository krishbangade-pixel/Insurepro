# InsurePro - Enterprise Insurance Management Platform

## Project Overview

InsurePro is a modern enterprise SaaS insurance management platform built with Next.js frontend and Express.js backend. The application provides comprehensive insurance management capabilities including policy management, claims processing, customer management, and agent workflows.

## Architecture

### Technology Stack

**Frontend:**
- **Framework**: Next.js 15.1.4 with App Router
- **Language**: React 19.0.0 with JavaScript/JSX
- **Styling**: Tailwind CSS with custom components
- **Authentication**: Supabase Auth with SSR support
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom component library with Framer Motion animations
- **Charts**: Recharts for data visualization

**Backend:**
- **Framework**: Express.js 4.18.2
- **Language**: Node.js
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase JWT verification
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Logging**: Morgan with audit trails

### Project Structure

```
InsurePro/
├── frontend/                 # Next.js application
│   ├── app/                  # App Router pages
│   │   ├── (admin)/         # Admin dashboard routes
│   │   ├── (auth)/          # Authentication routes
│   │   ├── agent/           # Agent dashboard
│   │   ├── customer/        # Customer portal
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable components
│   │   ├── auth/            # Authentication components
│   │   ├── common/          # Shared components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Base UI components
│   └── lib/                 # Utility libraries
├── backend/                 # Express API server
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── validations/     # Input validation
│   │   └── database/        # Database schema
│   └── server.js           # Entry point
└── agent.md               # This documentation
```

## Core Features

### User Roles & Access Control

The system supports three main user roles with distinct permissions:

1. **Admin**
   - Full system access
   - User management
   - System configuration
   - Analytics and reporting

2. **Insurance Agent**
   - Customer management
   - Policy creation and management
   - Claims processing
   - Commission tracking

3. **Customer**
   - Policy viewing
   - Claim submission
   - Payment management
   - Document access

### Key Modules

#### Authentication & Authorization
- Supabase-based authentication
- JWT token verification
- Role-based access control
- Secure password reset flow

#### Customer Management
- Customer profile management
- Contact information
- Policy history
- Risk assessment scoring

#### Policy Management
- Policy creation and underwriting
- Premium calculation
- Coverage management
- Renewal tracking

#### Claims Processing
- Claim submission and tracking
- Document upload
- Approval workflows
- Payment processing

#### Payment Management
- Premium billing
- Payment tracking
- Invoice generation
- Payment status monitoring

#### Document Management
- Secure file storage
- Document categorization
- Access control
- Version tracking

#### Reporting & Analytics
- Dashboard metrics
- Performance tracking
- Financial reporting
- Custom report generation

## Database Schema

### Core Tables

**profiles** - User authentication and role management
- Links to Supabase auth.users
- Role-based permissions
- User profile information

**customers** - Customer master data
- Personal and contact information
- Risk scoring
- Status tracking

**policies** - Insurance policy management
- Policy details and coverage
- Premium information
- Agent assignments

**claims** - Insurance claims processing
- Claim details and status
- Payment calculations
- Approval workflows

**premium_payments** - Payment tracking
- Invoice management
- Payment status
- Due date tracking

**documents** - File storage and management
- Document metadata
- Access permissions
- Version control

**notifications** - User notifications
- System alerts
- Status updates
- Communication logs

**audit_logs** - Security and compliance
- User activity tracking
- System changes
- Compliance reporting

## Security Features

### Authentication & Authorization
- Supabase JWT token verification
- Role-based access control (RBAC)
- Secure password hashing
- Session management

### Data Protection
- Row Level Security (RLS) policies
- Data encryption at rest
- Secure file uploads
- Audit trail logging

### Application Security
- Helmet security headers
- CORS configuration
- Rate limiting (200 requests/15min)
- Input validation and sanitization
- SQL injection prevention

## API Endpoints

The backend provides RESTful API endpoints organized by module:

- `/api/auth` - Authentication endpoints
- `/api/customers` - Customer management
- `/api/policies` - Policy operations
- `/api/claims` - Claims processing
- `/api/payments` - Payment management
- `/api/documents` - File operations
- `/api/notifications` - Notification system
- `/api/reports` - Reporting endpoints
- `/api/audit-logs` - Audit trail access
- `/api/agents` - Agent management

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account with PostgreSQL database

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure Supabase environment variables
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run database schema from `backend/src/database/schema.sql`
3. Configure environment variables with Supabase credentials

## Deployment

### Development
- Frontend: `npm run dev` (port 3000)
- Backend: `npm run dev` (port 5000)

### Production
- Frontend: `npm run build && npm start`
- Backend: `npm start`

## Key Dependencies

### Frontend Dependencies
- `@supabase/supabase-js` - Supabase client
- `@hookform/resolvers` - Form validation
- `framer-motion` - Animations
- `recharts` - Data visualization
- `next-themes` - Theme management
- `react-hot-toast` - Notifications

### Backend Dependencies
- `express` - Web framework
- `@supabase/supabase-js` - Database client
- `helmet` - Security headers
- `cors` - Cross-origin requests
- `express-rate-limit` - Rate limiting
- `morgan` - Request logging

## Development Guidelines

### Code Organization
- Follow Next.js App Router conventions
- Use consistent component naming
- Implement proper error handling
- Maintain TypeScript-like type safety

### Security Best Practices
- Never expose Supabase service role keys
- Implement proper input validation
- Use parameterized queries
- Follow principle of least privilege

### Performance Considerations
- Implement proper caching strategies
- Optimize database queries
- Use efficient component rendering
- Implement lazy loading where appropriate

## Future Enhancements

### Planned Features
- Mobile application development
- Advanced analytics and AI insights
- Integration with external insurance providers
- Automated underwriting capabilities
- Enhanced reporting and dashboard features

### Technical Improvements
- TypeScript migration
- Enhanced testing coverage
- Performance optimization
- Microservices architecture consideration

## Support & Documentation

For additional support:
- Refer to individual README files in frontend/ and backend/ directories
- Check SETUP.md files for detailed setup instructions
- Review database schema for data model understanding

This documentation provides a comprehensive overview of the InsurePro platform architecture, features, and development guidelines.