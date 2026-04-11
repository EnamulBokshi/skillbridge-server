# SkillBridge Server

> **Outcome-focused tutoring platform backend** for discovery, booking, trust, and conversion.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Value Proposition](#value-proposition)
- [Most Valuable Features](#most-valuable-features)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Contributing](#contributing)

## 🎯 Overview

SkillBridge is a production-ready backend for a tutoring marketplace. It helps teams launch and scale core tutoring flows quickly: tutor discovery, slot booking, trust-building social proof, and intelligent assistance.

It is designed to improve product outcomes:
- Increase conversion from visitor to booked session with AI-assisted tutor discovery.
- Improve learner confidence with transparent ratings, reviews, and testimonials.
- Reduce operational overhead through role-based automation and admin controls.
- Ship faster with modular APIs, strict validation, and Prisma-backed data access.

## 💼 Value Proposition

- **Faster MVP to market**: complete backend modules for auth, bookings, reviews, and admin operations.
- **Conversion-oriented APIs**: AI recommendations, public landing stats, and testimonials support acquisition funnels.
- **Operational control**: role-based authorization for Student, Tutor, and Admin workflows.
- **Scalable architecture**: modular service/controller/router design with PostgreSQL + Prisma.

### Key Capabilities

- **Acquisition**: public stats + testimonial APIs for landing pages
- **Activation**: AI chat and recommendations to match learners with suitable tutors
- **Transaction**: real-time slot discovery and booking lifecycle management
- **Retention**: review and profile systems that improve tutor quality and trust
- **Governance**: admin moderation and role-based access control

## 🌟 Most Valuable Features

### Tier 1: Growth and Conversion

- **AI Chat for Tutor Discovery** (`POST /api/v1/ai/chat`)
   - Answers only SkillBridge-relevant questions with filtered live context.
   - Reduces drop-off by guiding users to actionable next steps.

- **AI Tutor Recommendations** (`POST /api/v1/ai/tutor-recommendations`)
   - Uses deterministic DB filtering first, then AI ranking.
   - Balances relevance, speed, and token cost.

- **Public Landing Metrics** (`GET /api/v1/stats`)
   - Exposes students, tutors, slots/sessions, and subjects counts.
   - Strengthens social proof on landing pages.

### Tier 2: Trust and Content Quality

- **Testimonials with Ownership Control** (`/api/v1/testimonials`)
   - Publicly readable testimonials.
   - Only owner or admin can update/delete; admin has full privileges.

- **AI Writing Assistant**
   - `POST /api/v1/ai/write/tutor-bio`
   - `POST /api/v1/ai/write/review-suggestions`
   - Speeds up profile quality and consistent review language.

### Tier 3: Platform Reliability

- **Role-based Security** with middleware-driven authorization.
- **Structured modular architecture** for maintainability and team velocity.
- **Rate-limited AI endpoints** to control abuse and usage cost.

## ✨ Features

### For Students
- 📝 Create and manage student profiles
- 🔍 Browse tutors by category, subject, and ratings
- 📅 View available time slots and book sessions
- ⭐ Rate and review completed sessions
- 💬 Create personal testimonials visible on the landing page
- 📊 Track booking history and completed sessions
- 💬 Manage profile information and preferences

### For Tutors
- 👨‍🏫 Create comprehensive tutor profiles with bio and expertise
- 🕒 Create and manage availability slots
- 📚 Associate with multiple subjects and categories
- 📈 Track earnings, bookings, and ratings
- ✅ Accept or reject booking requests
- 📊 View performance analytics and student reviews

### For Administrators
- 👥 Manage users across all roles (Student, Tutor, Admin)
- 📊 Access platform-wide analytics and statistics
- 🏷️ Create and manage categories and subjects
- 📋 Monitor and manage all bookings
- 💰 Track platform earnings and tutor payouts
- 🧾 Moderate all testimonials with full CRUD privileges
- 🔒 Ban/Activate users and moderate content

### AI-Powered Experience
- 🤖 SkillBridge-only assistant with contextual responses
- 🧠 Smart tutor matching with ranking reasons
- ✍️ Tutor bio generator from profile data
- ✍️ Review suggestion generator based on rating tone
- 🚦 Abuse protection through per-user/IP AI rate limiting

## 🛠️ Tech Stack

### Core Framework
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript 5.9
- **Framework**: Express.js 5.2
- **Package Manager**: pnpm 10.26

### Database & ORM
- **Database**: PostgreSQL 16+
- **ORM**: Prisma 7.2
- **Adapter**: @prisma/adapter-pg
- **Migrations**: Prisma Migrate

### Authentication & Security
- **Auth System**: Better Auth 1.4.9
- **Auth Adapter**: Prisma Adapter
- **Password Hashing**: bcrypt (via Better Auth)
- **Session Management**: Token-based authentication

### Additional Dependencies
- **CORS**: Cross-Origin Resource Sharing support
- **Nodemailer**: Email notifications and verification
- **dotenv**: Environment variable management

### Development Tools
- **tsx**: Fast TypeScript execution
- **tsc-alias**: TypeScript path aliasing
- **Prisma Studio**: Database GUI

## 🏗️ Architecture

### Design Pattern
The application follows a **modular MVC architecture** with clear separation of concerns:

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│      Express Middleware         │
│  (CORS, Logger, Auth, 404)      │
└────────────┬────────────────────┘
             │
             ↓
┌────────────────────────────────┐
│         Routers                │
│  (Route definitions + Guards)  │
└────────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────┐
│       Controllers              │
│  (Request/Response handling)   │
└────────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────┐
│        Services                │
│  (Business logic + DB queries) │
└────────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────┐
│      Prisma Client             │
│  (Database abstraction)        │
└────────────┬───────────────────┘
             │
             ↓
┌────────────────────────────────┐
│      PostgreSQL Database       │
└────────────────────────────────┘
```

### Module Structure
Each feature module contains:
- **Router**: Route definitions and middleware guards
- **Controller**: HTTP request/response handling and validation
- **Service**: Business logic and database operations
- **Types**: TypeScript interfaces and type definitions

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **pnpm** v10.26 or higher
- **PostgreSQL** v16 or higher
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkillBridge/server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   pnpm prisma generate
   
   # Run migrations
   pnpm prisma migrate deploy
   
   # (Optional) Seed the database
   pnpm tsx src/scripts/seedAdmin.ts
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The server will start on `http://localhost:5000` (or your configured PORT)

### Verify Installation

```bash
# Test the API
curl http://localhost:5000/
# Expected: {"message": "Welcome to SkillBridge Server"}
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-must-be-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:5000
APP_URL=http://localhost:3000
PROD_APP_URL=https://your-app.vercel.app

# Email Configuration (for Better Auth email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Default Avatar URL (optional)
DEFAULT_AVATAR_URL=https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y

# Node Environment
NODE_ENV=development
PORT=5000
```

### Configuration Details

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `BETTER_AUTH_SECRET` | Secret key for auth tokens (min 32 chars) | `your-super-secret-key-here...` |
| `BETTER_AUTH_URL` | Backend URL for auth callbacks | `http://localhost:5000` |
| `APP_URL` | Frontend application URL | `http://localhost:3000` |
| `PROD_APP_URL` | Production frontend URL | `https://app.vercel.app` |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | Email account for sending | `noreply@example.com` |
| `EMAIL_PASSWORD` | Email account password/app password | `****` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Server port | `5000` |

## 🗄️ Database Setup

### Schema Overview

The database consists of core learning, scheduling, and trust models:

#### Core Models
- **User**: Authentication and base user data (Better Auth)
- **Student**: Student-specific profile information
- **TutorProfile**: Tutor-specific profile and credentials
- **Category**: Learning categories (e.g., Mathematics, Science)
- **Subject**: Specific subjects with credit hours
- **Slot**: Tutor availability time slots
- **Booking**: Student-tutor session bookings
- **Review**: Student feedback on completed sessions
- **Testimonial**: Public feedback displayed on marketing/landing pages
- **TutorSubject**: Many-to-many relation between tutors and subjects

### Key Relationships

```
User ──< Student ──< Booking >── Slot >── TutorProfile
                  ┗━< Review >━━━━━━━━━━━━━┛
                  
Category ──< Subject ──< Slot
         ┗━< TutorProfile
         
TutorProfile ──< TutorSubject >── Subject
```

### Database Migrations

```bash
# Create a new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations (production)
pnpm prisma migrate deploy

# Reset database (⚠️ DESTRUCTIVE)
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio
```

### Seeding

To create an initial admin user:

```bash
pnpm tsx src/scripts/seedAdmin.ts
```

## 📚 API Documentation

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-app.vercel.app`

### API Versioning

All endpoints are versioned under `/api/v1/`

### Authentication

Most endpoints require authentication via Bearer token:

```http
Authorization: Bearer <your-token-here>
```

### API Endpoints Overview

#### Authentication (`/api/auth/*`)
Handled by Better Auth - see [Better Auth Documentation](https://www.better-auth.com/docs)

- `POST /api/auth/sign-up` - Create new user account
- `POST /api/auth/sign-in/email` - Email/password login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session

#### Students (`/api/v1/students`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ User | Create student profile |
| `GET` | `/` | ✅ Admin | Get all students (paginated) |
| `GET` | `/:id` | ✅ Any | Get student by ID |
| `GET` | `/user/:userId` | ✅ User | Get student by user ID |
| `PATCH` | `/:id` | ✅ Owner/Admin | Update student profile |
| `DELETE` | `/:id` | ✅ Owner/Admin | Delete student profile |
| `GET` | `/:id/bookings` | ✅ Owner/Admin | Get student bookings |
| `GET` | `/:id/reviews` | ✅ Any | Get student reviews |

#### Tutors (`/api/v1/tutors`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ User | Create tutor profile |
| `GET` | `/` | - | Get all tutors (with filters) |
| `GET` | `/featured` | - | Get featured tutors |
| `GET` | `/:id` | - | Get tutor by ID |
| `GET` | `/user/:userId` | ✅ User | Get tutor by user ID |
| `PATCH` | `/:id` | ✅ Owner/Admin | Update tutor profile |
| `DELETE` | `/:id` | ✅ Owner/Admin | Delete tutor profile |
| `GET` | `/:id/slots` | - | Get tutor slots |
| `GET` | `/:id/bookings` | ✅ Owner/Admin | Get tutor bookings |
| `GET` | `/:id/reviews` | - | Get tutor reviews |
| `GET` | `/:id/stats` | ✅ Owner/Admin | Get tutor statistics |

#### Categories (`/api/v1/categories`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ Admin | Create category |
| `GET` | `/` | - | Get all categories |
| `GET` | `/:id` | - | Get category by ID |
| `PATCH` | `/:id` | ✅ Admin | Update category |
| `DELETE` | `/:id` | ✅ Admin | Delete category |
| `GET` | `/:id/subjects` | - | Get category subjects |
| `GET` | `/:id/tutors` | - | Get category tutors |

#### Subjects (`/api/v1/subjects`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ Admin | Create subject |
| `GET` | `/` | - | Get all subjects |
| `GET` | `/category/:categoryId` | - | Get subjects by category |
| `PATCH` | `/:id` | ✅ Admin | Update subject |
| `DELETE` | `/:id` | ✅ Admin | Delete subject |

#### Slots (`/api/v1/slots`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ Tutor | Create slot |
| `GET` | `/` | - | Get all slots (with filters) |
| `GET` | `/available` | - | Get available slots |
| `GET` | `/featured` | - | Get featured slots |
| `GET` | `/:id` | - | Get slot by ID |
| `GET` | `/tutor/:tutorId` | - | Get tutor slots |
| `GET` | `/subject/:subjectId` | - | Get subject slots |
| `PATCH` | `/:id` | ✅ Tutor/Admin | Update slot |
| `DELETE` | `/:id` | ✅ Tutor/Admin | Delete slot |

#### Bookings (`/api/v1/bookings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ Student | Create booking |
| `GET` | `/` | ✅ Admin | Get all bookings |
| `GET` | `/:id` | ✅ Owner/Admin | Get booking by ID |
| `GET` | `/student/:studentId` | ✅ Owner/Admin | Get student bookings |
| `GET` | `/tutor/:tutorId` | ✅ Owner/Admin | Get tutor bookings |
| `PATCH` | `/:id` | ✅ Owner/Admin | Update booking status |
| `DELETE` | `/:id` | ✅ Owner/Admin | Cancel booking |

#### Admin (`/api/v1/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | ✅ Admin | Get all users (paginated + filtered) |
| `GET` | `/users/:id` | ✅ Admin | Get user by ID |
| `PATCH` | `/users/:id` | ✅ Admin | Update user (role, status) |
| `DELETE` | `/users/:id` | ✅ Admin | Delete user |
| `GET` | `/bookings` | ✅ Admin | Get all bookings (filtered) |
| `GET` | `/stats/earnings` | ✅ Admin | Get total platform earnings |

#### Users (`/api/v1/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/me` | ✅ Any | Get current user profile |
| `PATCH` | `/me` | ✅ Any | Update current user |

#### AI (`/api/v1/ai`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/chat` | ✅ Any | Domain-aware assistant for tutors, slots, and platform questions |
| `POST` | `/tutor-recommendations` | ✅ Any | Personalized tutor recommendations and ranked output |
| `POST` | `/write/tutor-bio` | ✅ Any | Generate concise tutor bios from structured profile data |
| `POST` | `/write/review-suggestions` | ✅ Any | Generate review text suggestions by rating tone |
| `GET` | `/models` | - | List available Gemini models |

#### Stats (`/api/v1/stats`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | - | Public platform counters for landing page (students, tutors, slots, subjects) |

#### Testimonials (`/api/v1/testimonials`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | - | Public list of testimonials (paginated) |
| `GET` | `/:id` | - | Public testimonial details |
| `POST` | `/` | ✅ User/Student/Admin | Create testimonial |
| `PATCH` | `/:id` | ✅ Owner/Admin | Update testimonial (owner only unless admin) |
| `DELETE` | `/:id` | ✅ Owner/Admin | Delete testimonial (owner only unless admin) |

### Request/Response Examples

#### Create Subject
```http
POST /api/v1/subjects
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Advanced Calculus",
  "categoryId": "uuid-of-category",
  "creditHours": 3,
  "slug": "advanced-calculus",
  "description": "Advanced mathematical concepts in calculus",
  "isActive": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Advanced Calculus",
    "categoryId": "uuid-of-category",
    "creditHours": 3,
    "slug": "advanced-calculus",
    "description": "Advanced mathematical concepts in calculus",
    "isActive": true,
    "createdAt": "2026-02-27T10:00:00Z",
    "updatedAt": "2026-02-27T10:00:00Z"
  },
  "error": null,
  "message": "Subject created successfully"
}
```

#### Update Subject
```http
PATCH /api/v1/subjects/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Advanced Calculus II",
  "categoryId": "new-category-uuid",
  "creditHours": 4,
  "isActive": false
}
```

**Features**:
- ✅ Validates category exists
- ✅ Checks slug uniqueness
- ✅ Filters updatable fields
- ✅ Returns updated subject with category info

### Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "message": "Error summary"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## 📁 Project Structure

```
server/
├── prisma/                      # Database schema and migrations
│   ├── schema/                  # Modular Prisma schemas
│   │   ├── schema.prisma        # Main schema config
│   │   ├── auth.prisma          # Better Auth models
│   │   ├── student.prisma       # Student model
│   │   ├── tutorProfile.prisma  # Tutor model
│   │   ├── category.prisma      # Category model
│   │   ├── subject.prisma       # Subject model
│   │   ├── slot.prisma          # Slot model
│   │   ├── booking.prisma       # Booking model
│   │   ├── review.prisma        # Review model
│   │   ├── testimonial.prisma   # Public testimonial model
│   │   └── tutorSubject.prisma  # Junction table
│   └── migrations/              # Migration history
│
├── src/
│   ├── app.ts                   # Express app configuration
│   ├── server.ts                # Server entry point
│   ├── server.vercel.ts         # Vercel deployment entry
│   │
│   ├── config/                  # Configuration files
│   │   └── config.ts            # App configuration
│   │
│   ├── constants/               # Application constants
│   │   └── userRole.ts          # User role enums
│   │
│   ├── generated/               # Auto-generated files
│   │   └── prisma/              # Prisma Client
│   │
│   ├── helpers/                 # Utility functions
│   │   ├── errorHandler.ts     # Error handling utilities
│   │   ├── errorResponse.ts    # Error response formatter
│   │   ├── successResponse.ts  # Success response formatter
│   │   ├── paginationHelper.ts # Pagination utilities
│   │   └── idGenerator.ts      # ID generation helpers
│   │
│   ├── lib/                     # Core libraries
│   │   ├── auth.ts              # Better Auth configuration
│   │   ├── prisma.ts            # Prisma client instance
│   │   └── nodeMailerTransport.ts # Email configuration
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.ts   # Authentication guard
│   │   ├── private.middleware.ts # Authorization guard
│   │   ├── logger.middleware.ts # Request logger
│   │   └── 404Route.middleware.ts # 404 handler
│   │
│   ├── modules/                 # Feature modules
│   │   ├── admin/               # Admin management
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   └── admin.router.ts
│   │   ├── student/             # Student management
│   │   ├── tutor/               # Tutor management
│   │   ├── category/            # Category management
│   │   ├── subject/             # Subject management
│   │   ├── slot/                # Slot management
│   │   ├── booking/             # Booking management
│   │   ├── review/              # Review management
│   │   ├── ai/                  # AI assistant and writing endpoints
│   │   ├── stats/               # Public landing-page stats endpoint
│   │   ├── testimonial/         # Testimonial management with ownership checks
│   │   └── user/                # User management
│   │
│   ├── scripts/                 # Utility scripts
│   │   └── seedAdmin.ts         # Admin seeding script
│   │
│   └── types/                   # TypeScript type definitions
│       └── index.ts             # Shared types and interfaces
│
├── docs/                        # API documentation
│   ├── AdminAPI.tsx             # Admin API reference
│   ├── StudentAPI.tsx           # Student API reference
│   ├── TutorAPI.tsx             # Tutor API reference
│   └── GetTutorsAPI-Summary.md  # Tutor API summary
│
├── .env.example                 # Environment template
├── package.json                 # Dependencies and scripts
├── pnpm-lock.yaml              # Lock file
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment config
├── VERCEL_DEPLOYMENT_GUIDE.md  # Deployment documentation
└── README.md                    # This file
```

### Module Architecture

Each module follows this pattern:

```
module/
├── module.controller.ts  # HTTP handlers, validation, response formatting
├── module.service.ts     # Business logic, database queries
└── module.router.ts      # Route definitions, middleware guards
```

## 🔒 Authentication

### Better Auth Integration

SkillBridge uses [Better Auth](https://www.better-auth.com/) for authentication and authorization.

#### Key Features
- **Email/Password Authentication**: Secure credential-based login
- **Session Management**: Token-based sessions
- **Email Verification**: Optional email verification flow
- **Password Reset**: Secure password recovery
- **Role-Based Access Control**: USER, STUDENT, TUTOR, ADMIN roles
- **Prisma Adapter**: Seamless database integration

#### Configuration

Authentication is configured in [`src/lib/auth.ts`](src/lib/auth.ts):

```typescript
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER" },
      status: { type: "string", defaultValue: "ACTIVE" },
      isAssociate: { type: "boolean", defaultValue: false }
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  }
});
```

#### Using Auth Middleware

Protect routes with role-based guards:

```typescript
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRole } from "../../constants/userRole.js";

// Admin only
router.post("/", authMiddleware(UserRole.ADMIN), controller.create);

// Tutor or Admin
router.patch("/:id", authMiddleware([UserRole.TUTOR, UserRole.ADMIN]), controller.update);

// Any authenticated user
router.get("/me", authMiddleware(), controller.getMe);
```

#### User Roles

```typescript
export enum UserRole {
  USER = "USER",         // Default role
  STUDENT = "STUDENT",   // Student profile created
  TUTOR = "TUTOR",       // Tutor profile created
  ADMIN = "ADMIN"        // Administrator
}
```

#### User Status

```typescript
export enum UserStatus {
  ACTIVE = "ACTIVE",     // Can use platform
  BANNED = "BANNED",     // Access revoked
  INACTIVE = "INACTIVE"  // Temporarily disabled
}
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

SkillBridge is optimized for deployment on Vercel. See detailed guide: [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

#### Quick Deploy

1. **Install Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Development
   vercel
   
   # Production
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add BETTER_AUTH_SECRET
   vercel env add BETTER_AUTH_URL
   # ... add all required env vars
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

### Database Setup for Production

**Recommended PostgreSQL Providers:**
- [Neon](https://neon.tech/) - Serverless Postgres (Free tier)
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Integrated with Vercel
- [Railway](https://railway.app/) - Infrastructure platform

### Environment Configuration

Ensure all environment variables are set in Vercel Dashboard:
- Project Settings → Environment Variables
- Set for Production, Preview, and Development environments

### Post-Deployment

After deployment, run migrations:
```bash
# Using Vercel CLI
vercel env pull .env.production
pnpm prisma migrate deploy
```

## 📜 Scripts

Available npm/pnpm scripts:

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Start development server with hot reload |
| `build` | `pnpm build` | Build for production (compiles TypeScript) |
| `start` | `pnpm start` | Start production server |
| `postinstall` | Auto-runs | Generate Prisma Client after install |
| `vercel-build` | Auto-runs | Vercel deployment build script |

### Prisma Scripts

| Command | Description |
|---------|-------------|
| `pnpm prisma generate` | Generate Prisma Client |
| `pnpm prisma migrate dev` | Create and apply migrations (dev) |
| `pnpm prisma migrate deploy` | Apply migrations (production) |
| `pnpm prisma migrate reset` | Reset database (⚠️ destructive) |
| `pnpm prisma studio` | Open Prisma Studio GUI |
| `pnpm prisma db push` | Sync schema without migration |

### Custom Scripts

```bash
# Seed admin user
pnpm tsx src/scripts/seedAdmin.ts

# Run any TypeScript file
pnpm tsx path/to/file.ts
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation
4. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use async/await over promises

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For questions, issues, or feature requests:

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@skillbridge.com

## 🙏 Acknowledgments

- [Better Auth](https://www.better-auth.com/) - Authentication framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Express](https://expressjs.com/) - Fast, unopinionated web framework
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ by the SkillBridge Team**

*Happy Learning! 🎓*
