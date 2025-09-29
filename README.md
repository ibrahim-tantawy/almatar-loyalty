# Almatar Loyalty Application By Ibrahim Tantawy

A Node.js-based loyalty points transfer system that allows users to transfer points to each other with expiration and confirmation mechanisms.

## Quick Start Guide

Follow these steps to set up, test, and use the Almatar Loyalty application:

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git

### Step 1: Project Setup

#### 1.1 Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/ibrahim-tantawy/almatar-loyalty
cd almatar-loyalty

# Install dependencies
npm install
```

#### 1.2 Environment Configuration

```bash
# Copy environment file
cp .env.example .env
```

#### 1.3 Configure Environment Variables

Edit the `.env` file with your database credentials:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=almatar_loyalty
DB_NAME_TEST=almatar_loyalty_test
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important**: Replace `your_mysql_password` with your actual MySQL root password.

### Step 2: Database Setup

#### 2.1 Create Development Database

```bash
# Initialize the development database
npm run init-db
```

#### 2.2 Create Test Database

```bash
# Setup test database (drops and recreates)
npm run setup-test-db
```

### Step 3: Start the Application

#### 3.1 Start in Development Mode

```bash
npm run dev
```

#### 3.2 Start in Production Mode

```bash
npm start
```

The API is now running at: `http://localhost:3000`

### Step 4: Run Tests

#### 4.1 Run All Tests

```bash
npm test
```

#### 4.2 Run Specific Test Suites

```bash
# Database tests only
npm run test:db

# Authentication tests only
npm run test:auth

# Transfer tests only
npm run test:transfer
```

#### 4.3 Run Tests with Coverage

```bash
npm run test:coverage
```

### Step 5: Test with Postman

#### 5.1 Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select the `almatar-loyalty-postman.json` file from the project root
4. Click **Import**

#### 5.2 Configure Environment Variables in Postman

1. In Postman, click on the **Environment quick look** (eye icon)
2. Click **Edit** next to the imported environment
3. Set the variables:
   - `baseUrl`: `http://localhost:3000`
   - `authToken`: (will be auto-filled after login)

#### 5.3 Test the API Workflow

Follow this sequence in Postman:

##### Step 5.3.1: Register Users

**Request**: Register User

```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Expected Response (201 Created)**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "pointsBalance": 500,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Repeat for second user:

- Change `email` to `bob@example.com`
- Change `name` to `Bob Smith`

##### Step 5.3.2: Login Users

**Request**: Login User (for Alice)

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Note**: The auth token is automatically saved to the `authToken` variable.

##### Step 5.3.3: Check Points Balance

**Request**: Get User Points

**Expected Response**:

```json
{
  "success": true,
  "message": "Points retrieved successfully",
  "data": {
    "points": 500
  }
}
```

##### Step 5.3.4: Create Points Transfer

**Request**: Create Transfer

```json
{
  "recipientEmail": "bob@example.com",
  "points": 100
}
```

**Expected Response (201 Created)**:

```json
{
  "success": true,
  "message": "Transfer created successfully",
  "data": {
    "id": 1,
    "senderId": 1,
    "recipientEmail": "bob@example.com",
    "recipientId": null,
    "points": 100,
    "status": "pending",
    "token": "a1b2c3d4e5f6...",
    "expiresAt": "2024-01-01T00:10:00.000Z",
    "confirmedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

Save the transfer `token` from the response for the next step.

##### Step 5.3.5: Confirm Transfer

1. Login as Bob using the **Login User** request
2. Update the auth token in Postman environment
3. **Request**: Confirm Transfer

```json
{
  "token": "a1b2c3d4e5f6..." // Use the token from previous step
}
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Transfer confirmed successfully",
  "data": {
    "id": 1,
    "senderId": 1,
    "recipientEmail": "bob@example.com",
    "recipientId": 2,
    "points": 100,
    "status": "confirmed",
    "token": "a1b2c3d4e5f6...",
    "expiresAt": "2024-01-01T00:10:00.000Z",
    "confirmedAt": "2024-01-01T00:05:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z"
  }
}
```

##### Step 5.3.6: View Transfer History

**Request**: Get User Transfers

**Expected Response**:

```json
{
  "success": true,
  "message": "Transfers retrieved successfully",
  "data": {
    "transfers": [
      {
        "id": 1,
        "senderId": 1,
        "recipientEmail": "bob@example.com",
        "recipientId": 2,
        "points": 100,
        "status": "confirmed",
        "token": "a1b2c3d4e5f6...",
        "expiresAt": "2024-01-01T00:10:00.000Z",
        "confirmedAt": "2024-01-01T00:05:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

##### Step 5.3.7: Health Check

**Request**: Health Check

**Expected Response**:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Step 6: Troubleshooting

#### Common Issues and Solutions

##### Database Connection Issues

**Problem**: `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solution**:

- Verify MySQL is running: `sudo service mysql start`
- Check credentials in `.env` file
- Ensure database user has proper permissions

##### Test Failures

**Problem**: Tests fail with database errors

**Solution**:

```bash
# Reset test database completely
npm run setup-test-db
npm test
```

##### Port Already in Use

**Problem**: `Error: listen EADDRINUSE :::3000`

**Solution**:

- Change `PORT` in `.env` file
- Or kill the process: `npx kill-port 3000`

##### JWT Token Issues

**Problem**: Invalid token errors

**Solution**:

- Ensure `JWT_SECRET` is set in `.env`
- Re-login to get a new valid token

### API Reference Summary

#### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/users/points` | Get user points | Yes |
| POST | `/api/transfers` | Create transfer | Yes |
| POST | `/api/transfers/confirm` | Confirm transfer | Yes |
| GET | `/api/transfers` | Get transfer history | Yes |
| GET | `/health` | Health check | No |

#### Transfer Status Types

- `pending` - Waiting for confirmation
- `confirmed` - Successfully completed
- `expired` - Not confirmed within 10 minutes
- `cancelled` - Manually cancelled

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controllers   │ →  │     Services     │ →  │   Repositories  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ↓                       ↓                       ↓
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  HTTP Requests  │    │  Business Logic  │    │   Data Access   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Features Implemented

- Clean Architecture with SOLID principles
- Comprehensive error handling
- Input validation with Joi
- JWT authentication
- Password hashing with bcrypt
- Database transactions for data consistency
- Rate limiting and security headers
- Automated transfer expiration
- Pagination for transfer history
- Comprehensive test coverage

### Next Steps

After successful setup, you can:

- Explore the codebase to understand the architecture
- Add new features like transfer cancellation
- Extend the API with admin endpoints
- Deploy to production with proper environment setup
- Add monitoring and logging for production use