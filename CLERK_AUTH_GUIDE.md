# Clerk Authentication - Developer Guide

> **Target Audience**: Junior developers working independently on this fullstack webapp
> **Purpose**: Comprehensive guide to understand, set up, and work with Clerk authentication

---

## Table of Contents

1. [Overview](#overview)
2. [What is Clerk?](#what-is-clerk)
3. [Architecture Overview](#architecture-overview)
4. [Prerequisites](#prerequisites)
5. [Initial Setup](#initial-setup)
6. [Frontend Implementation](#frontend-implementation)
7. [Backend Implementation](#backend-implementation)
8. [Database Integration](#database-integration)
9. [Common Development Tasks](#common-development-tasks)
10. [Testing Authentication](#testing-authentication)
11. [Troubleshooting](#troubleshooting)
12. [Security Best Practices](#security-best-practices)

---

## Overview

This application uses **Clerk** as its authentication provider. Clerk handles:
- User sign-up and sign-in
- Session management
- JWT token generation
- User profile management
- OAuth providers (Google, GitHub, etc.)

The authentication flow synchronizes Clerk users with our local database, allowing us to maintain user-related data and relationships within our application.

---

## What is Clerk?

Clerk is a modern authentication and user management platform that provides:
- **Drop-in UI components** for sign-in/sign-up
- **Secure authentication** with industry best practices
- **JWT tokens** for API authentication
- **Webhooks** for user lifecycle events
- **User management dashboard** (clerk.com)

**Why Clerk?**: It eliminates the need to build authentication from scratch, handling security, session management, and UI components for us.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Frontend (React + Clerk Components)                 │   │
│  │  - ClerkProvider wraps entire app                    │   │
│  │  - ProtectedRoute guards pages                       │   │
│  │  - useAuth() hook provides auth state                │   │
│  │  - UserButton for user menu                          │   │
│  └───────────┬──────────────────────────────────────────┘   │
│              │                                              │
└──────────────┼──────────────────────────────────────────────┘
               │
               │ JWT Token in Authorization Header
               │
┌──────────────▼──────────────────────────────────────────────┐
│                     Backend (FastAPI)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Middleware (deps.py)                           │   │
│  │  - Extracts JWT from Authorization header            │   │
│  │  - Validates JWT using Clerk's JWKS                  │   │
│  │  - Fetches user from database by clerk_id            │   │
│  │  - Returns CurrentUser for protected endpoints       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Webhook Handler (/webhooks/clerk)                   │   │
│  │  - Receives user.created events from Clerk           │   │
│  │  - Verifies webhook signature using Svix             │   │
│  │  - Creates user record in local database             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Protected Endpoints                                 │   │
│  │  - /tasks, /users require CurrentUserDep             │   │
│  │  - Only accessible with valid JWT                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
               │
               │ Creates user in DB
               │
┌──────────────▼───────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  User Table                                           │   │
│  │  - id (UUID, primary key)                             │   │
│  │  - clerk_id (string, unique, indexed)                 │   │
│  │  - email (string, unique)                             │   │
│  │  - full_name (string, nullable)                       │   │
│  │  - is_active (boolean)                                │   │
│  │  - is_superuser (boolean)                             │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
               ▲
               │
┌──────────────┴───────────────────────────────────────────────┐
│                     Clerk Dashboard                          │
│  - Sends webhook when user.created                           │
│  - Manages user accounts                                     │
│  - Issues JWT tokens                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before setting up Clerk authentication, ensure you have:

1. **Node.js and Bun** (for frontend)
2. **Python 3.12+** with `uv` (for backend)
3. **PostgreSQL** database running
4. **A Clerk account** (free tier available at https://clerk.com)
5. **ngrok or similar** (for local webhook testing - optional but recommended)

---

## Initial Setup

### Step 1: Create a Clerk Account and Application

1. Go to https://clerk.com and sign up
2. Create a new application in the Clerk dashboard
3. Choose your authentication methods (Email, Google, GitHub, etc.)
4. Note your application name - you'll need it for configuration

### Step 2: Get Your Clerk Credentials

You'll need **three** key pieces of information from your Clerk dashboard:

#### 2.1 Frontend: Publishable Key
- In Clerk dashboard, go to **"API Keys"**
- Copy the **"Publishable key"** (starts with `pk_test_` or `pk_live_`)
- This is safe to expose in frontend code

#### 2.2 Backend: Secret Key (for sync script)
- In the same **"API Keys"** section
- Copy the **"Secret key"** (starts with `sk_test_` or `sk_live_`)
- ⚠️ **NEVER expose this in frontend or commit to git**

#### 2.3 Backend: JWT Configuration
- Go to **"JWT Templates"** in Clerk dashboard
- Create or select the default template
- Copy the **"Issuer"** URL (e.g., `https://your-app.clerk.accounts.dev`)
- The JWKS URL follows this pattern: `https://your-app.clerk.accounts.dev/.well-known/jwks.json`

#### 2.4 Backend: Webhook Secret (for user sync)
- Go to **"Webhooks"** in Clerk dashboard
- Click **"+ Add Endpoint"**
- For local development, use ngrok or similar to expose your local backend:
  ```bash
  ngrok http 8000
  ```
- Enter your webhook URL: `https://your-ngrok-url.ngrok.io/webhooks/clerk`
- Select the event: **"user.created"**
- Click **"Create"**
- Copy the **"Signing Secret"** (starts with `whsec_`)

### Step 3: Configure Environment Variables

#### 3.1 Root `.env` file (shared config)

```bash
# Database credentials
POSTGRES_DB=family_task_hub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_SERVER=db  # Use 'db' for Docker, 'localhost' for local
POSTGRES_PORT=5432

# pgAdmin (optional)
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin

# Frontend - Clerk Publishable Key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 3.2 Backend-specific `.env` (in `backend/` directory)

Create a `backend/.env` file with:

```bash
# Clerk Authentication - Backend
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET_KEY=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_JWT_ISSUER=https://your-app.clerk.accounts.dev
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json

# Database (inherited from root .env but can override)
POSTGRES_DB=family_task_hub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_SERVER=localhost  # or 'db' for Docker
POSTGRES_PORT=5432
```

> 💡 **Important**: Add both `.env` files to `.gitignore` to prevent credential leaks!

### Step 4: Install Dependencies

#### Frontend
```bash
cd frontend
bun install
```

The `@clerk/clerk-react` package should already be in `package.json`:
```json
{
  "dependencies": {
    "@clerk/clerk-react": "5.59.6"
  }
}
```

#### Backend
```bash
cd backend
uv sync
```

The backend dependencies in `pyproject.toml` include:
```toml
dependencies = [
    "pyjwt[crypto]>=2.11.0",  # For JWT verification
    "svix>=1.84.1",            # For webhook signature verification
    "fastapi[standard]>=0.124.2",
    # ... other deps
]
```

### Step 5: Run Database Migration

The Clerk authentication requires a `clerk_id` column in the `user` table:

```bash
cd backend
uv run alembic upgrade head
```

This migration (`d73289e99e19_add_clerk_id_to_users.py`):
- Adds `clerk_id` column to the user table
- Makes it unique and indexed
- Removes old `hashed_password` column (we don't store passwords anymore!)
- Migrates existing users with `OLD_USER_<ID>` placeholder

---

## Frontend Implementation

### Structure

```
frontend/src/
├── main.tsx                    # Root - ClerkProvider setup
├── App.tsx                     # Routes with AuthLayout
└── features/
    └── auth/
        ├── index.ts            # Public exports
        ├── config/
        │   └── authConfig.ts   # Clerk configuration
        ├── components/
        │   └── ProtectedRoute.tsx  # Route protection
        ├── hooks/
        │   └── useAuth.ts      # Auth hook wrapper
        └── layouts/
            └── AuthLayout.tsx  # Layout wrapper for protected pages
```

### Key Files Explained

#### 1. `main.tsx` - ClerkProvider Setup

This is the **entry point** where we wrap our app with Clerk:

```tsx
import { ClerkProvider } from "@clerk/clerk-react";
import { authConfig } from "./features/auth";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={authConfig.publishableKey}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ApiProvider>
            <App />
          </ApiProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
```

**What this does**:
- `ClerkProvider` must wrap the entire app
- It provides authentication context to all child components
- Pass the `publishableKey` from your config

#### 2. `authConfig.ts` - Configuration

```typescript
export const authConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,

  validate() {
    if (!this.publishableKey) {
      throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
    }
  },
} as const;

authConfig.validate();
```

**What this does**:
- Reads the Clerk publishable key from environment variables
- Validates it exists at startup (fail fast if misconfigured)
- Uses Vite's `import.meta.env` for environment variables

#### 3. `ProtectedRoute.tsx` - Route Protection

```tsx
import {
  SignedIn,
  SignedOut,
  SignIn,
  ClerkLoading,
  ClerkLoaded,
} from "@clerk/clerk-react";

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return (
    <>
      <ClerkLoading>
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="text-gray-500">Loading...</div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <SignedOut>
          <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md">
              <SignIn />
            </div>
          </div>
        </SignedOut>
        <SignedIn>{children}</SignedIn>
      </ClerkLoaded>
    </>
  );
};
```

**What this does**:
- Shows loading state while Clerk initializes
- Shows Clerk's sign-in UI if user is not authenticated
- Shows protected content if user is signed in
- **No manual redirect logic needed** - Clerk components handle it!

#### 4. `AuthLayout.tsx` - Layout Wrapper

```tsx
import { Outlet } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";

const AuthLayout = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};
```

**What this does**:
- Wraps all child routes with `ProtectedRoute`
- Uses React Router's `Outlet` to render child routes
- Used in `App.tsx` to protect multiple routes at once

#### 5. `useAuth.ts` - Custom Auth Hook

```typescript
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

export const useAuth = () => {
  const { isLoaded, userId, sessionId, getToken, signOut } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  return {
    isLoaded: isLoaded && isUserLoaded,
    isAuthenticated: !!userId,
    userId,
    sessionId,
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: user.fullName || "",
      imageUrl: user.imageUrl,
    } : null,
    getToken: async (options?: { template?: string }) => {
      try {
        return await getToken(options);
      } catch (error) {
        console.error("Error getting token:", error);
        return null;
      }
    },
    signOut: () => signOut(),
  };
};
```

**What this does**:
- Wraps Clerk's hooks to provide a consistent interface
- Normalizes user data into a predictable format
- Adds error handling for token retrieval
- **Use this hook in your components** instead of Clerk's hooks directly

#### 6. `ApiProvider.tsx` - Automatic Token Injection

```tsx
import { useAuth } from "@clerk/clerk-react";
import apiClient from "../services/apiClient";

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Request interceptor - add Bearer token to all requests
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Failed to get auth token:", error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  return <>{children}</>;
};
```

**What this does**:
- Automatically adds JWT token to **every API request**
- Uses Axios interceptors to modify requests before they're sent
- Token is fetched fresh for each request (Clerk handles caching)
- **You never need to manually add Authorization headers!**

### Using Clerk UI Components

Clerk provides pre-built, customizable UI components:

#### UserButton - User Profile Menu

```tsx
import { UserButton } from "@clerk/clerk-react";

// In your Navbar
<UserButton />
```

This renders a user avatar that opens a menu with:
- User profile
- Account settings
- Sign out

#### SignIn / SignUp Components

```tsx
import { SignIn, SignUp } from "@clerk/clerk-react";

// Sign in page
<SignIn />

// Sign up page
<SignUp />
```

These are full-featured auth forms with:
- Email/password
- OAuth providers (Google, GitHub, etc.)
- Email verification
- Password reset
- All configured in Clerk dashboard

---

## Backend Implementation

### Structure

```
backend/src/
├── main.py                     # FastAPI app with CORS
├── api/
│   ├── deps.py                 # Auth dependencies
│   └── routes/
│       ├── tasks.py            # Protected endpoints
│       ├── users.py            # Protected endpoints
│       └── webhooks.py         # Clerk webhook handler
├── core/
│   ├── config.py               # Settings with Clerk env vars
│   └── db.py                   # Database connection
├── models/
│   └── users.py                # User model with clerk_id
├── webhooks/
│   └── handlers.py             # User creation handler
└── scripts/
    └── sync_clerk_users.py     # Manual sync script
```

### Key Files Explained

#### 1. `config.py` - Configuration

```python
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    # Clerk configuration
    CLERK_WEBHOOK_SECRET_KEY: str = Field(init=False)
    CLERK_JWT_ISSUER: str = Field(init=False)
    CLERK_JWKS_URL: str = Field(init=False)
    
    # Database configuration
    POSTGRES_DB: str = Field(init=False)
    POSTGRES_USER: str = Field(init=False)
    POSTGRES_PASSWORD: str = Field(init=False)
    POSTGRES_SERVER: str = Field("db", init=False)
    POSTGRES_PORT: str = Field("5432", init=False)

settings = Settings()
```

**What this does**:
- Uses Pydantic Settings to load environment variables
- `Field(init=False)` means values must come from environment (not constructor)
- Automatically validates all required fields exist
- **If a required env var is missing, the app won't start** (fail fast!)

#### 2. `deps.py` - Authentication Dependencies

This is the **heart of backend authentication**. It provides dependency injection for FastAPI routes.

##### JWT Token Verification

```python
from jwt import PyJWKClient
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()

def get_jwks_client() -> PyJWKClient:
    return PyJWKClient(uri=settings.CLERK_JWKS_URL, cache_keys=True)

def verify_clerk_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
):
    token = credentials.credentials
    
    try:
        jwks_client = get_jwks_client()
        signin_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signin_key,
            algorithms=["RS256"],
            issuer=settings.CLERK_JWT_ISSUER,
            options={"verify_aud": False},
        )
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token was expired")
    except jwt.InvalidIssuerError:
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials")

ClerkTokenDep = Annotated[dict, Depends(verify_clerk_token)]
```

**What this does**:
1. `HTTPBearer()` extracts `Authorization: Bearer <token>` header
2. Fetches Clerk's public keys from JWKS endpoint (cached)
3. Verifies token signature using RS256 algorithm
4. Validates token issuer matches your Clerk instance
5. Returns decoded token payload with user info
6. **Note**: `verify_aud=False` because Clerk doesn't always set audience

**When to use**: Not directly - use `CurrentUserDep` instead (see below)

##### Current User Dependency

```python
from sqlmodel import select
from src.models.users import User

def get_current_user(token_payload: ClerkTokenDep, session: SessionDep) -> User:
    clerk_id = token_payload.get("sub")
    if not clerk_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing user ID")
    
    user = session.exec(select(User).where(User.clerk_id == clerk_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is deactivated")
    
    return user

CurrentUserDep = Annotated[User, Depends(get_current_user)]
```

**What this does**:
1. Gets the verified token payload (via `ClerkTokenDep`)
2. Extracts `sub` (subject) claim which contains Clerk user ID
3. Queries database for user with matching `clerk_id`
4. Returns the full `User` object from database
5. Validates user exists and is active

**When to use**: In **every protected endpoint** that needs user information

#### 3. `routes/tasks.py` - Protected Endpoints

```python
from fastapi import APIRouter, Depends
from src.api.deps import SessionDep, get_current_user

router = APIRouter(
    prefix="/tasks",
    tags=["task"],
    dependencies=[Depends(get_current_user)]  # Protects ALL routes in this router
)

@router.get("/", response_model=list[TaskPublic])
def read_tasks(session: SessionDep):
    # This endpoint is automatically protected
    # Only authenticated users can access it
    statement = select(Task).options(selectinload(Task.assignee))
    tasks = session.exec(statement).all()
    return tasks

@router.post("/", status_code=201, response_model=TaskPublic])
def create_task(task_in: TaskCreate, session: SessionDep):
    # Also protected automatically
    task = Task.model_validate(task_in)
    session.add(task)
    session.commit()
    return task
```

**What this does**:
- `dependencies=[Depends(get_current_user)]` protects **all routes** in the router
- If JWT is invalid/missing, request is rejected with 401
- If JWT is valid but user not in DB, request is rejected with 404
- If user is inactive, request is rejected with 403

**Alternative**: Add `CurrentUserDep` to individual endpoints if you need the user object:

```python
@router.post("/")
def create_task(
    task_in: TaskCreate,
    session: SessionDep,
    current_user: CurrentUserDep  # Now you have the user object
):
    task = Task.model_validate(task_in)
    task.creator_id = current_user.id  # Can use user info
    session.add(task)
    session.commit()
    return task
```

#### 4. `routes/webhooks.py` - Clerk Webhook Handler

```python
from fastapi import APIRouter, HTTPException, Request
from svix import Webhook, WebhookVerificationError
from src.webhooks.handlers import handle_user_created

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/clerk")
async def clerk_webhook(request: Request, session: SessionDep):
    payload = await request.body()
    
    # Verify webhook signature using Svix
    if settings.CLERK_WEBHOOK_SECRET_KEY:
        try:
            wh = Webhook(settings.CLERK_WEBHOOK_SECRET_KEY)
            event = wh.verify(payload, dict(request.headers))
        except WebhookVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        event = json.loads(payload)
    
    event_type = event.get("type")
    user_data = event.get("data")
    
    if event_type == "user.created":
        handle_user_created(session, user_data)
```

**What this does**:
1. Receives webhook POST from Clerk when user signs up
2. Verifies webhook signature using Svix library (security!)
3. Parses event type and user data
4. Calls appropriate handler based on event type
5. **Currently only handles `user.created` events**

**Why webhook verification matters**:
- Without verification, anyone could POST fake user data
- Svix signature proves the request came from Clerk
- Uses webhook secret key from Clerk dashboard

#### 5. `webhooks/handlers.py` - User Creation Handler

```python
from sqlalchemy.exc import SQLAlchemyError
from src.models.users import User

def handle_user_created(db: Session, user_data: dict) -> None:
    try:
        clerk_id = user_data.get("id")
        if not clerk_id:
            raise WebhookDataError("Clerk ID is missing")
        
        email_addresses = user_data.get("email_addresses")
        if not email_addresses or not isinstance(email_addresses, list):
            raise WebhookDataError("Missing or invalid email addresses")
        
        primary_email = email_addresses[0].get("email_address")
        if not primary_email:
            raise WebhookDataError("Missing email address")
        
        first_name = user_data.get("first_name", "")
        last_name = user_data.get("last_name", "")
        full_name = f"{first_name} {last_name}".strip() if first_name or last_name else None
        
        user = User(
            clerk_id=clerk_id,
            email=primary_email,
            full_name=full_name,
            is_active=True,
            is_superuser=False,
        )
        
        db.add(user)
        db.commit()
    
    except (WebhookDataError, SQLAlchemyError) as e:
        db.rollback()
        raise
```

**What this does**:
1. Extracts user info from Clerk webhook payload
2. Validates required fields exist
3. Creates new `User` record in database
4. Links user to Clerk via `clerk_id`
5. Rolls back on error

**Important fields**:
- `clerk_id`: Clerk's unique user ID (from `user_data["id"]`)
- `email`: Primary email from Clerk
- `full_name`: Constructed from first + last name
- `is_active`: Set to True by default
- `is_superuser`: Set to False by default

#### 6. `models/users.py` - User Model

```python
from sqlmodel import Field, Relationship, SQLModel
from pydantic import EmailStr
import uuid

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    clerk_id: str = Field(unique=True, index=True, max_length=255)

class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tasks: list["Task"] = Relationship(back_populates="assignee")
```

**Key points**:
- `clerk_id` is **unique** and **indexed** for fast lookups
- No `password` or `hashed_password` field (Clerk handles authentication!)
- `email` is validated using Pydantic's `EmailStr`
- `id` is a UUID (not the same as Clerk ID)
- Can have relationships to other models (tasks, etc.)

#### 7. `scripts/sync_clerk_users.py` - Manual Sync Tool

This script synchronizes users from Clerk to your database:

```bash
# Sync all users
uv run python -m src.scripts.sync_clerk_users

# Dry run (preview changes without applying)
uv run python -m src.scripts.sync_clerk_users --dry-run

# Deactivate users that no longer exist in Clerk
uv run python -m src.scripts.sync_clerk_users --deactivate-missing
```

**When to use**:
- Initial setup to import existing Clerk users
- After webhook issues (missed events)
- Periodic sync to catch any discrepancies
- Testing with existing Clerk accounts

**What it does**:
1. Fetches all users from Clerk API using secret key
2. Compares with local database
3. **Creates** users that exist in Clerk but not locally
4. **Updates** users if email/name changed
5. **Reactivates** users that were deactivated
6. Optionally **deactivates** users not in Clerk

---

## Database Integration

### Migration: Adding `clerk_id`

The migration `d73289e99e19_add_clerk_id_to_users.py` modified the user table:

```python
def upgrade() -> None:
    # Add clerk_id column
    op.add_column("user",
        sa.Column("clerk_id", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=True)
    )
    
    # Migrate existing users with placeholder IDs
    op.execute("""
        UPDATE "user"
        SET clerk_id = 'OLD_USER_' || CAST(id AS TEXT)
        WHERE clerk_id IS NULL
    """)
    
    # Make clerk_id required and unique
    op.alter_column("user", "clerk_id", nullable=False)
    op.create_index(op.f("ix_user_clerk_id"), "user", ["clerk_id"], unique=True)
    
    # Remove password field (no longer needed!)
    op.drop_column("user", "hashed_password")
```

**What this did**:
1. Added `clerk_id` column
2. Gave existing users placeholder IDs (`OLD_USER_<uuid>`)
3. Made `clerk_id` required and unique
4. Created index for fast lookups
5. Removed password storage (security improvement!)

**Result**:
```sql
CREATE TABLE "user" (
    id UUID PRIMARY KEY,
    clerk_id VARCHAR(255) NOT NULL UNIQUE,  -- NEW!
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX ix_user_clerk_id ON "user" (clerk_id);
```

### User Lookup Flow

When a request comes in:

```
1. Frontend sends: Authorization: Bearer eyJhbGc...
                   └─> JWT token from Clerk

2. Backend extracts token from header
   └─> HTTPBearer() in deps.py

3. Backend verifies JWT signature
   └─> verify_clerk_token() fetches Clerk's public keys
   └─> Validates signature, issuer, expiration

4. Backend extracts clerk_id from token
   └─> token_payload["sub"] = "user_2abc123..."

5. Backend queries database
   └─> SELECT * FROM user WHERE clerk_id = 'user_2abc123...'

6. Backend returns User object
   └─> CurrentUserDep injects into endpoint
```

---

## Common Development Tasks

### Task 1: Access Current User in an Endpoint

```python
from src.api.deps import CurrentUserDep

@router.post("/tasks")
def create_task(
    task_in: TaskCreate,
    session: SessionDep,
    current_user: CurrentUserDep  # ← Add this parameter
):
    # Now you have access to the user
    print(f"User {current_user.email} is creating a task")
    
    task = Task.model_validate(task_in)
    task.creator_id = current_user.id  # Use user ID
    session.add(task)
    session.commit()
    return task
```

### Task 2: Protect a New Endpoint

**Option A: Protect entire router**
```python
router = APIRouter(
    prefix="/my-endpoint",
    dependencies=[Depends(get_current_user)]  # All routes protected
)
```

**Option B: Protect specific route**
```python
@router.get("/public")
def public_endpoint():
    return {"message": "Anyone can access"}

@router.get("/protected", dependencies=[Depends(get_current_user)])
def protected_endpoint():
    return {"message": "Only authenticated users"}
```

### Task 3: Create a Protected Page in Frontend

```tsx
// pages/MyProtectedPage.tsx
import { useAuth } from "@/features/auth";

const MyProtectedPage = () => {
  const { user, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.fullName}!</h1>
      {/* Your page content */}
    </div>
  );
};

export default MyProtectedPage;
```

```tsx
// App.tsx
<Route element={<AuthLayout />}>
  <Route path="/my-page" element={<MyProtectedPage />} />
</Route>
```

The `AuthLayout` wrapper automatically protects the route!

### Task 4: Make an Authenticated API Request

**You don't need to do anything special!** The `ApiProvider` automatically adds tokens.

```tsx
// This just works - token is added automatically
const response = await apiClient.get('/tasks');
const tasks = response.data;
```

If you need to manually get a token:
```tsx
const { getToken } = useAuth();

const token = await getToken();
// Use token for external API calls, etc.
```

### Task 5: Add a New Webhook Event Handler

```python
# In webhooks.py
if event_type == "user.updated":
    handle_user_updated(session, user_data)
elif event_type == "user.deleted":
    handle_user_deleted(session, user_data)
```

```python
# In handlers.py
def handle_user_updated(db: Session, user_data: dict) -> None:
    clerk_id = user_data.get("id")
    user = db.exec(select(User).where(User.clerk_id == clerk_id)).first()
    
    if user:
        user.email = user_data["email_addresses"][0]["email_address"]
        user.full_name = f"{user_data['first_name']} {user_data['last_name']}".strip()
        db.commit()
```

**Don't forget**: Subscribe to the new event in Clerk dashboard under Webhooks!

### Task 6: Sign Out a User

```tsx
import { useAuth } from "@/features/auth";

const LogoutButton = () => {
  const { signOut } = useAuth();

  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  );
};
```

Clerk handles:
- Clearing session
- Redirecting to sign-in page
- Revoking tokens

### Task 7: Customize Clerk UI Appearance

```tsx
// In ClerkProvider
<ClerkProvider
  publishableKey={authConfig.publishableKey}
  appearance={{
    elements: {
      card: "shadow-lg",
      headerTitle: "text-2xl font-bold",
      formButtonPrimary: "bg-teal-600 hover:bg-teal-700",
    },
  }}
>
```

See Clerk's [appearance customization docs](https://clerk.com/docs/customization/overview) for full options.

---

## Testing Authentication

### Manual Testing Checklist

#### Frontend
- [ ] Sign up with email creates new account
- [ ] Sign in with existing account works
- [ ] OAuth providers work (if enabled)
- [ ] Accessing protected route redirects to sign-in
- [ ] After sign-in, user is redirected back
- [ ] UserButton shows correct user info
- [ ] Sign out clears session

#### Backend
- [ ] Accessing protected endpoint without token returns 401
- [ ] Accessing with invalid token returns 401
- [ ] Accessing with expired token returns 401
- [ ] Accessing with valid token returns data
- [ ] New user sign-up triggers webhook
- [ ] User is created in database with correct clerk_id

### Testing Webhooks Locally

**Problem**: Clerk needs a public URL to send webhooks, but backend runs on localhost.

**Solution**: Use ngrok or similar tunneling tool.

#### Step 1: Install ngrok
```bash
# macOS
brew install ngrok

# Linux
snap install ngrok

# Or download from https://ngrok.com
```

#### Step 2: Start your backend
```bash
cd backend
uv run uvicorn src.main:app --reload --port 8000
```

#### Step 3: Tunnel to your backend
```bash
ngrok http 8000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:8000
```

#### Step 4: Configure webhook in Clerk
1. Go to Clerk dashboard → Webhooks
2. Add endpoint: `https://abc123.ngrok.io/webhooks/clerk`
3. Select event: `user.created`
4. Save

#### Step 5: Test
1. Sign up a new user in frontend
2. Check ngrok terminal for webhook request
3. Check backend logs for user creation
4. Verify user exists in database:
   ```bash
   psql -U postgres -d family_task_hub -c "SELECT * FROM \"user\" ORDER BY id DESC LIMIT 1;"
   ```

### Automated Testing

#### Backend Tests

```python
# tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_protected_endpoint_without_token():
    response = client.get("/tasks")
    assert response.status_code == 401

def test_protected_endpoint_with_invalid_token():
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/tasks", headers=headers)
    assert response.status_code == 401

# For testing with valid token, you'd need to mock the JWT verification
# or use a real test token from Clerk's test environment
```

#### Frontend Tests

```tsx
// __tests__/ProtectedRoute.test.tsx
import { render, screen } from '@testing-library/react';
import { ClerkProvider } from '@clerk/clerk-react';
import { ProtectedRoute } from '@/features/auth';

test('shows sign-in when not authenticated', () => {
  render(
    <ClerkProvider publishableKey="pk_test_...">
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    </ClerkProvider>
  );
  
  // Should show sign-in, not protected content
  expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
});
```

---

## Troubleshooting

### Problem: "Missing VITE_CLERK_PUBLISHABLE_KEY"

**Symptom**: App crashes on startup with error about missing env variable.

**Solution**:
1. Check `.env` file exists in project root
2. Verify variable is spelled correctly: `VITE_CLERK_PUBLISHABLE_KEY`
3. Restart dev server after adding env variable
4. For Docker, rebuild container: `docker-compose up --build`

### Problem: "Token verification failed"

**Symptom**: Backend returns 401 "Could not validate credentials" even with valid token.

**Possible causes**:

**1. Wrong JWT issuer**
```python
# In backend/.env
CLERK_JWT_ISSUER=https://your-app.clerk.accounts.dev  # Must match exactly!
```

Check Clerk dashboard → JWT Templates → Issuer URL

**2. Wrong JWKS URL**
```python
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json
```

Must be issuer + `/.well-known/jwks.json`

**3. Token expired**
Tokens expire after 1 hour by default. Frontend should automatically refresh, but if not:
- Clear browser cookies/storage
- Sign out and back in

**4. Time sync issue**
If server time is wrong, JWT validation fails. Check:
```bash
date  # Should be current time
```

### Problem: "Webhook signature verification failed"

**Symptom**: Backend logs "Invalid signature" when webhook fires.

**Solution**:
1. Copy webhook secret from Clerk dashboard (starts with `whsec_`)
2. Update `backend/.env`:
   ```
   CLERK_WEBHOOK_SECRET_KEY=whsec_...
   ```
3. Restart backend
4. Re-send webhook from Clerk dashboard to test

### Problem: "User not found" after sign-in

**Symptom**: Frontend sign-in succeeds, but API calls return 404.

**Cause**: User wasn't created in database (webhook failed or didn't fire).

**Solution**:
1. Check backend logs for webhook errors
2. Manually sync users:
   ```bash
   cd backend
   uv run python -m src.scripts.sync_clerk_users
   ```
3. Verify user exists:
   ```bash
   psql -U postgres -d family_task_hub -c "SELECT clerk_id, email FROM \"user\";"
   ```

### Problem: Webhooks not firing locally

**Symptom**: New user signs up but doesn't appear in database.

**Solution**:
1. Verify ngrok is running and forwarding to port 8000
2. Check Clerk webhook endpoint URL matches ngrok URL
3. Check "Message Attempts" in Clerk dashboard for errors
4. Verify webhook subscribed to `user.created` event
5. Check backend logs for incoming webhook requests

### Problem: CORS errors in browser

**Symptom**: "Access to fetch blocked by CORS policy"

**Solution**:
Check `main.py` CORS configuration:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Frontend dev server
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Make sure frontend URL is in `allow_origins`.

### Problem: "Token has no sub claim"

**Symptom**: Backend error "Invalid token: missing user ID"

**Cause**: JWT token doesn't contain `sub` (subject) claim.

**Solution**:
1. Check JWT template in Clerk dashboard
2. Ensure default claims are enabled
3. Token should look like:
   ```json
   {
     "sub": "user_2abc123...",
     "iss": "https://your-app.clerk.accounts.dev",
     "exp": 1234567890,
     ...
   }
   ```

### Problem: Frontend stuck on loading screen

**Symptom**: ProtectedRoute shows "Loading..." forever.

**Possible causes**:

**1. Clerk publishable key is wrong**
Check browser console for Clerk errors.

**2. Network issue**
Clerk can't reach authentication servers. Check internet connection.

**3. Browser blocking third-party cookies**
Clerk uses cookies for session management. Check browser settings.

**Solution**: Enable cookies for `clerk.accounts.dev` domain.

### Problem: Database migration fails

**Symptom**: Error running `alembic upgrade head`

**Possible causes**:

**1. Existing users without clerk_id**
The migration handles this with placeholder IDs, but if it fails:
```sql
-- Manually fix
UPDATE "user" SET clerk_id = 'TEMP_' || CAST(id AS TEXT) WHERE clerk_id IS NULL;
```

**2. Duplicate email addresses**
Fix duplicates before migrating:
```sql
SELECT email, COUNT(*) FROM "user" GROUP BY email HAVING COUNT(*) > 1;
```

**3. Database connection failed**
Verify database is running and credentials are correct in `.env`.

---

## Security Best Practices

### ✅ DO

1. **Keep secrets in environment variables**
   - Never commit `.env` files
   - Use different keys for development and production
   - Rotate keys periodically

2. **Verify webhook signatures**
   - Always verify Svix signature in production
   - Don't skip verification even for testing

3. **Validate user is active**
   - Check `is_active` flag before allowing actions
   - Deactivated users should not access system

4. **Use HTTPS in production**
   - Clerk requires HTTPS for production webhooks
   - Never send tokens over HTTP

5. **Set short token expiration**
   - Default 1 hour is good
   - Configure in Clerk dashboard if needed

6. **Check permissions**
   - Don't just authenticate - also authorize
   - Verify user has permission for the action

7. **Log authentication events**
   - Log failed authentication attempts
   - Monitor for suspicious patterns

### ❌ DON'T

1. **Never store passwords**
   - Clerk handles authentication
   - No need for password fields

2. **Never expose secret key in frontend**
   - Only publishable key goes in frontend
   - Secret key stays in backend only

3. **Don't trust client-side data**
   - Always verify on backend
   - User can be in Clerk but not database

4. **Don't skip token verification**
   - Always verify JWT signature
   - Don't just decode without verifying

5. **Don't use user input directly**
   - Validate and sanitize all inputs
   - Use Pydantic models for validation

6. **Don't hardcode credentials**
   - Use environment variables
   - Never commit secrets to git

7. **Don't ignore webhook failures**
   - Monitor webhook delivery
   - Set up sync script as backup

### Production Checklist

Before going to production:

- [ ] Use production Clerk keys (not test keys)
- [ ] Set up production webhook endpoint with HTTPS
- [ ] Enable webhook signature verification
- [ ] Set strong database password
- [ ] Enable database SSL connection
- [ ] Set up monitoring for auth failures
- [ ] Configure rate limiting
- [ ] Set up backup sync job (cron)
- [ ] Test fail-over scenarios
- [ ] Document incident response procedures
- [ ] Set up alerts for webhook failures
- [ ] Review Clerk security settings
- [ ] Enable MFA for admin accounts
- [ ] Set up log aggregation
- [ ] Test token revocation

---

## Additional Resources

### Official Documentation
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Backend API](https://clerk.com/docs/reference/backend-api)
- [JWT Verification](https://clerk.com/docs/backend-requests/handling/manual-jwt)
- [Webhooks Guide](https://clerk.com/docs/integrations/webhooks/overview)

### Helpful Tools
- [JWT.io](https://jwt.io) - Decode and inspect JWTs
- [ngrok](https://ngrok.com) - Tunnel for webhook testing
- [Postman](https://www.postman.com) - Test API endpoints with auth
- [Clerk Dashboard](https://dashboard.clerk.com) - Manage users and settings

### Example Code
All code examples in this guide are from this repository:
- Frontend: `frontend/src/features/auth/`
- Backend: `backend/src/api/deps.py`, `backend/src/api/routes/webhooks.py`
- Models: `backend/src/models/users.py`

### Getting Help

1. **Check error messages**: Most issues have clear error messages
2. **Check logs**: Backend logs often show what's wrong
3. **Check Clerk dashboard**: See webhook attempts and user data
4. **Use browser dev tools**: Check network tab for failed requests
5. **Read this guide**: Search for your error message

---
