# Synaxis (MoneyMatters)

**Personal Finance & AI-Powered Insurance Management Platform**

Synaxis is a comprehensive personal finance and insurance management application that combines intelligent financial tracking with AI-powered policy analysis. It helps users manage their money through transaction tracking, financial goal-setting, asset management, and AI-driven insurance coverage optimization.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Architecture Overview](#2-architecture-overview)
3. [App Screens & Features](#3-app-screens--features)
4. [Backend Services & API Endpoints](#4-backend-services--api-endpoints)
5. [AI Agents](#5-ai-agents)
6. [Data Models](#6-data-models)
7. [Security Features](#7-security-features)
8. [Data Visualization](#8-data-visualization)
9. [Getting Started](#9-getting-started)

---

## 1. Tech Stack

### Frontend

| Component          | Technology                                        |
|--------------------|---------------------------------------------------|
| Framework          | React Native (Expo SDK 54)                        |
| Navigation         | React Navigation (Native Stack Navigator)         |
| Icons              | Lucide React Native                               |
| Charts             | React Native Gifted Charts (Line, Bar, Pie)       |
| Gradients          | Expo Linear Gradient                              |
| State Management   | React Context (Auth Context, Theme Context)       |
| Storage            | AsyncStorage (persistent), Expo Secure Store (encrypted) |
| Platforms          | iOS, Android, Web                                 |

### Backend

| Component          | Technology                                        |
|--------------------|---------------------------------------------------|
| Runtime            | Node.js + TypeScript (tsx)                        |
| API Framework      | Express.js                                        |
| Database           | PostgreSQL with Prisma ORM                        |
| AI Model           | Anthropic Claude Sonnet (via Anthropic SDK)       |
| Authentication     | JWT (Access + Refresh Tokens), Bcrypt password hashing |
| File Uploads       | Multer (PDF handling)                             |
| PDF Parsing        | pdf-parse library                                 |
| Security           | Helmet, JWT verification, inter-service key auth  |
| Rate Limiting      | Express Rate Limit middleware                     |
| Validation         | Zod schema validation                             |
| HTTP Client        | Axios (inter-service communication)               |

### Deployment

| Component          | Technology                                        |
|--------------------|---------------------------------------------------|
| Cloud              | AWS EC2 instance                                  |
| Database           | AWS RDS (PostgreSQL)                              |
| Reverse Proxy      | Nginx on port 80, routing to microservices        |
| Containerized      | All 5 backend services running on EC2             |

---

## 2. Architecture Overview

Synaxis uses a microservices architecture with 5 backend services communicating through REST APIs, fronted by an Nginx reverse proxy.

```
+----------------------------+
|   React Native / Expo      |
|   (iOS, Android, Web)      |
+-------------+--------------+
              |
      Nginx Reverse Proxy (Port 80)
              |
  +-----------+-----------+
  |           |           |
  v           v           v
/api/auth  /api/finance  /api/policies  /api/ai  /api/dashboard
  |           |              |              |          |
  v           v              v              v          v
Auth       Finance        Policy          AI       Dashboard
Service    Service        Service       Service    Service
:3001      :3002          :3003         :3004      :3005
  |           |              |              |          |
  +-----+-----+--------------+--------------+----------+
        |
        v
  PostgreSQL Database (AWS RDS)
  (4 databases: auth, finance, policy, ai)
```

Dashboard Service acts as an aggregator — it calls Auth, Finance, Policy, and AI services in parallel to return a unified overview in one request.

---

## 3. App Screens & Features

### 3.1 Authentication Screen

Two-step registration and login flow.

**Step 1 — Account Creation:**
- First name, last name
- Email address
- Password with strength validation:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit
  - At least 1 special character
- Password confirmation
- Toggle between Sign Up and Sign In

**Step 2 — Personalization (Sign-up only):**
- Age
- Gender (Male, Female, Non-binary, Prefer not to say)
- Occupation (free text)
- Employment status: Full-time, Part-time, Self-employed, Freelancer, Student, Unemployed, Retired
- Income range bracket selection

**Features:**
- Animated step transitions
- Brand panel with feature highlights
- Error handling with user-friendly alerts

### 3.2 Hub Screen (Main Dashboard)

Central navigation point after login with financial overview.

**Components:**
- Header with Synaxis logo, theme toggle, profile badge, logout
- Personalized welcome message with user's first name
- Quick Stats Cards:
  - Current savings balance (formatted currency)
  - Current savings rate (percentage)
- Tool Navigation Cards:
  1. **Financial Tracker** — Tags: "Budget & Goals", "Charts & Reports"
  2. **Synaxis AI** (Insurance Analysis) — Tags: "Gap Analysis", "AI Scenarios"

**Features:**
- Dynamic data fetching from Finance API
- Dark / light theme support
- Smooth navigation transitions
- Responsive layout

### 3.3 Financial Tracker Screen

Comprehensive personal finance management dashboard.

#### Transaction Management

Full CRUD (Create, Read, Update, Delete) for:
- **Income entries:** monthly amount, frequency
- **Variable expenses:** Food, Dining Out, Gas, Transport, Shopping, Entertainment, Healthcare, Other
- **Fixed expenses:** Rent/Mortgage, Utilities, Insurance Premiums, Loan Payments, Subscriptions, Phone/Internet, Property Tax, HOA Fees, Other

**Transaction Display:**
- Search by description or category
- Category filtering dropdown
- Paginated list (8 items per page)
- Grouped by date (newest first)
- Category-specific icons

#### Charts & Visualization

- **Income & Expense Trend (Line Chart):** Monthly view (last 12 months) / Yearly view, interactive tooltips, area fill under curves
- **Income vs Expenses Comparison (Bar Chart):** Side-by-side monthly or yearly bars, top labels showing amounts in thousands
- **Spending by Category (Pie/Donut Chart):** Category breakdown with percentages, color-coded segments, center label with total
- **Savings Trend (Bar Chart):** Net savings (income - expenses) per period, green for positive, red for negative months

#### Financial Summary

- Total monthly income
- Total monthly expenses
- Net amount (income minus expenses)
- Overall savings rate percentage
- Computed in real-time from all transactions

#### Savings Management

Full CRUD for multiple savings accounts/types: Liquid Savings, Stocks, Index Funds, 401(k), IRA, Locked CD, Crypto, Other

Tracks:
- Current balance per account
- Monthly savings contribution
- Description / notes

#### Savings Goals

Full CRUD for financial goals:
- Goal name
- Target amount
- Current progress amount
- Deadline date

Display:
- Progress bar visualization
- Percentage complete badge
- Formatted deadline date
- Support for multiple simultaneous goals

#### Asset Management

Full CRUD for personal asset inventory.

**Asset Types:** Real Estate, Vehicle, Electronics, Jewelry, Collectibles, Furniture, Other

Tracks:
- Asset name
- Asset type with emoji icons
- Estimated value
- Description

### 3.4 Policy Screen (Synaxis AI)

Insurance policy management with AI-powered analysis.

#### Policy Management

- Upload PDF policy documents with:
  - Policy type selection (Health, Life, Auto, Home, Disability, Liability, Umbrella, Other)
  - Renewal date
- View all uploaded policies as cards showing:
  - Provider name
  - Premium amount and frequency
  - Coverage score (Well Covered / Partial / Uncovered)
  - Expiration / renewal date
  - What's covered (checklist items)
  - What's excluded (alert items)
  - Risk assessment score
- Delete policies

#### Asset Management (Insurance Context)

- Same asset types as Financial Tracker
- Links assets to coverage verification
- Full CRUD operations

#### Coverage Gap Analysis

- AI automatically detects coverage gaps on upload
- Expandable / collapsible gap items
- Severity indicators per gap
- Recommendations for closing gaps

#### AI Scenario Simulator (Chat Interface)

- Conversational what-if scenario testing
- User asks questions like:
  - "What happens if I lose my job for 3 months?"
  - "What if I buy a house for $500k?"
- AI generates 12-month projections comparing:
  - **Path A:** Status quo (no changes)
  - **Path B:** Proposed scenario
- Month-by-month delta analysis
- Confidence scoring
- AI-generated recommendations
- Message history with user/bot differentiation
- Auto-scroll to latest messages

#### PDF Upload Flow

1. User selects PDF and policy type
2. Frontend uploads via multipart form
3. Policy Service validates and stores file
4. Async callback triggers AI Service parsing
5. AI extracts structured data (provider, coverage, gaps, etc.)
6. Results displayed on policy card

### 3.5 Profile Screen

User information display and settings.

**Displays:**
- Full name, email address, age, gender
- Occupation, employment status, income range bracket
- Connected financial metrics

**Features:**
- Theme toggle (Light / Dark mode)
- Editable profile fields
- Financial summary connection

---

## 4. Backend Services & API Endpoints

### 4.1 Auth Service (Port 3001)

User registration, authentication, and profile management.

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/auth/register`  | Create account with demographics     |
| POST   | `/api/auth/login`     | Sign in (returns access + refresh tokens) |
| POST   | `/api/auth/logout`    | Terminate session                    |
| GET    | `/api/auth/profile`   | Fetch user profile info              |
| POST   | `/api/auth/refresh`   | Refresh JWT tokens                   |

Auth: JWT Bearer tokens with refresh token rotation. Security: Bcrypt password hashing, rate limiting.

### 4.2 Finance Service (Port 3002)

Manages income, expenses, savings, goals, and assets.

**Income:**

| Method | Endpoint                     | Description         |
|--------|------------------------------|---------------------|
| GET    | `/api/finance/income`        | List income sources |
| POST   | `/api/finance/income`        | Add income source   |
| PATCH  | `/api/finance/income/:id`    | Update income source|
| DELETE | `/api/finance/income/:id`    | Delete income source|

**Fixed Expenses:**

| Method | Endpoint                              | Description          |
|--------|---------------------------------------|----------------------|
| GET    | `/api/finance/expenditure/fixed`      | List fixed expenses  |
| POST   | `/api/finance/expenditure/fixed`      | Add fixed expense    |
| PATCH  | `/api/finance/expenditure/fixed/:id`  | Update fixed expense |
| DELETE | `/api/finance/expenditure/fixed/:id`  | Delete fixed expense |

**Variable Expenses:**

| Method | Endpoint                                  | Description              |
|--------|-------------------------------------------|--------------------------|
| GET    | `/api/finance/expenditure/variable`       | List variable expenses   |
| POST   | `/api/finance/expenditure/variable`       | Add variable expense     |
| PATCH  | `/api/finance/expenditure/variable/:id`   | Update variable expense  |
| DELETE | `/api/finance/expenditure/variable/:id`   | Delete variable expense  |

**Savings:**

| Method | Endpoint                     | Description            |
|--------|------------------------------|------------------------|
| GET    | `/api/finance/savings`       | List savings accounts  |
| POST   | `/api/finance/savings`       | Add savings account    |
| PATCH  | `/api/finance/savings/:id`   | Update savings account |
| DELETE | `/api/finance/savings/:id`   | Delete savings account |

**Goals:**

| Method | Endpoint                    | Description     |
|--------|-----------------------------|-----------------|
| GET    | `/api/finance/goals`        | List goals      |
| POST   | `/api/finance/goals`        | Create goal     |
| PATCH  | `/api/finance/goals/:id`    | Update goal     |
| DELETE | `/api/finance/goals/:id`    | Delete goal     |

**Assets:**

| Method | Endpoint                    | Description     |
|--------|-----------------------------|-----------------|
| GET    | `/api/finance/assets`       | List assets     |
| POST   | `/api/finance/assets`       | Add asset       |
| PATCH  | `/api/finance/assets/:id`   | Update asset    |
| DELETE | `/api/finance/assets/:id`   | Delete asset    |

**Summary:**

| Method | Endpoint                    | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | `/api/finance/summary`      | Overall financial health summary|

**Financial Health Score Algorithm (0–100):**
- Expense Ratio: 40 points (based on expenses-to-income ratio)
- Savings Rate: 35 points (based on savings percentage)
- Emergency Fund: 25 points (based on months of expenses saved)

Security: All endpoints require JWT authentication. Encryption: AES-256-GCM field-level encryption for monetary values.

### 4.3 Policy Service (Port 3003)

Insurance policy document management.

| Method | Endpoint              | Description                                        |
|--------|-----------------------|----------------------------------------------------|
| POST   | `/api/policies/`      | Upload PDF policy (multipart form-data)            |
| GET    | `/api/policies/`      | List user's policies (filterable by type, status)  |
| GET    | `/api/policies/:id`   | Get full policy details with parsed data and gaps  |
| DELETE | `/api/policies/:id`   | Delete policy and associated file                  |

**Policy Types:** HEALTH, LIFE, AUTO, HOME, DISABILITY, LIABILITY, UMBRELLA, OTHER

**Parse Status:** PENDING → COMPLETED | FAILED

Security: JWT authentication, PDF file validation, size limits.

### 4.4 AI Service (Port 3004)

Hosts four AI agents using Anthropic Claude Sonnet.

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| POST   | `/api/ai/parse`              | Trigger policy PDF parsing (service auth) |
| GET    | `/api/ai/parse/status/:id`   | Check parse job status               |
| POST   | `/api/ai/watchdog`           | Run financial health analysis (JWT)  |
| POST   | `/api/ai/scenario`           | Create what-if scenario projection (JWT) |
| GET    | `/api/ai/scenarios`          | List past scenarios (JWT)            |
| GET    | `/api/ai/scenario/:id`       | Get specific scenario details (JWT)  |

See [AI Agents](#5-ai-agents) for detailed agent descriptions.

### 4.5 Dashboard Service (Port 3005)

Aggregator service — calls all other services in parallel.

| Method | Endpoint                      | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/api/dashboard/overview`     | Unified financial + policy overview  |

Fetches from Auth, Finance, Policy, and AI services simultaneously, returning a single consolidated response to reduce frontend round-trips.

---

## 5. AI Agents

### 5.1 Policy Parser Agent

- **Purpose:** Extract structured data from insurance policy PDFs
- **Inputs:** Raw PDF text content, policy type
- **Outputs:** Provider name, policy number, covered items, excluded items, premium amount & frequency, coverage risk score, identified gaps
- **Trigger:** Async callback from Policy Service after upload
- **Auth:** Inter-service key validation

### 5.2 Watchdog Agent (Financial Health Monitor)

- **Purpose:** Analyze user's complete financial profile
- **Inputs:** Income, expenses, savings, assets, goals data
- **Outputs:** Health score (0–100), risk flags with severity (low/medium/high), actionable recommendations, budget breakdown (50/30/20 rule), spending pattern analysis
- **Trigger:** User request or dashboard aggregation
- **Auth:** JWT required

### 5.3 Orchestrator Agent

- **Purpose:** Coordinate complex multi-step financial queries
- **Inputs:** Complex user queries requiring multiple data sources
- **Outputs:** Routed responses from appropriate sub-agents
- **Trigger:** Internal service routing
- **Auth:** Internal service key

### 5.4 Scenario Simulator Agent

- **Purpose:** Run 12-month what-if financial projections
- **Inputs:** Current financial state + proposed scenario (job change, major purchase, expense cut, etc.)
- **Outputs:**
  - Month-by-month projections for two paths:
    - **Path A** — Status Quo (no changes)
    - **Path B** — With Proposed Scenario
  - Delta analysis between paths, confidence level, risk assessment, AI recommendations
- **Trigger:** User request via chat interface
- **Auth:** JWT required

---

## 6. Data Models

### User Profile
- `firstName`, `lastName`, `email`, `password` (hashed)
- `age`, `gender`, `occupation`
- `employmentStatus`, `incomeRange`
- Timestamps (created, updated)
- Linked: Finance Profile, Policies

### Financial Data
- **Income items:** monthly amount, frequency, description
- **Fixed expenses:** 9 categories with amounts
- **Variable expenses:** 8 categories with amounts
- **Savings items:** 8 types with balances and monthly contributions
- **Goals:** name, target amount, current amount, deadline
- **Assets:** name, type (7 categories), estimated value, description

### Policy Data
- PDF document (stored on disk)
- Policy type, parse status
- Parsed data: provider, coverage items, exclusions, gaps
- Premium amount and frequency
- Coverage risk score
- Renewal / expiration date

### AI Data
- Policy parse job records (async status tracking)
- Scenario simulations with monthly projections
- Watchdog financial health reports

---

## 7. Security Features

- JWT-based authentication with access + refresh token rotation
- Bcrypt password hashing (salted)
- AES-256-GCM field-level encryption for all monetary values
- Password strength validation (8+ chars, mixed case, digit, special)
- Helmet security headers on all services
- Rate limiting on all API endpoints
- Inter-service authentication keys (service-to-service calls)
- Expo Secure Store for encrypted client-side token storage
- PDF file type and size validation on uploads
- Input validation with Zod schemas
- CORS configuration

---

## 8. Data Visualization

- **Line Charts:** Income & expense trends (monthly / yearly), interactive tooltips, area fills, curved lines
- **Bar Charts:** Income vs expenses comparison (side-by-side), savings trend (green positive, red negative)
- **Pie/Donut:** Spending by category with percentages
- **Progress Bars:** Savings goal completion tracking
- **Stat Cards:** Summary metrics with icons and color coding
- **Badges:** Percentage complete, coverage scores
- All charts support dark and light themes

---

## 9. Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode) or Android Emulator
- PostgreSQL database (local or AWS RDS)

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/CSingh26/MoneyMatters.git
   cd MoneyMatters
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment — create a `.env` file with API URLs:
   ```env
   EXPO_PUBLIC_AUTH_API=http://localhost:3001
   EXPO_PUBLIC_FINANCE_API=http://localhost:3002
   EXPO_PUBLIC_POLICY_API=http://localhost:3003
   EXPO_PUBLIC_AI_API=http://localhost:3004
   EXPO_PUBLIC_DASHBOARD_API=http://localhost:3005
   ```

4. Start the app:
   ```bash
   npx expo start --ios       # iOS Simulator
   npx expo start --android   # Android Emulator
   npx expo start --web       # Web Browser
   ```

### Backend Setup

Each service (auth, finance, policy, ai, dashboard) runs independently under the `backend/` directory. Each requires:

1. Its own `.env` file with database URL, JWT secrets, and service keys
2. Prisma schema migration: `npx prisma migrate dev`
3. Start command: `npm run dev`

Services communicate via REST APIs. Nginx reverse proxy routes `/api/*` paths to the appropriate service port.

---

## License

MIT

---

## Hackathon

![Innovation Hack](Innovationhack-214.jpg)
