# Feature Flag Management API

REST API for managing feature flags, built with Node.js, Express, and MongoDB.

## Features

- **Feature Flag Management**

  - Create, read, update, and delete feature flags
  - Toggle features on/off
  - Track flag creation and updates

- **Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Secure password hashing with bcryptjs

- **Security Features**

  - Rate limiting to prevent abuse
  - Helmet for HTTP security headers
  - CORS enabled
  - Request validation

- **Logging & Monitoring**

  - Winston logger implementation
  - Morgan HTTP request logging
  - Error tracking and handling

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Detailed API endpoints documentation
  - Request/Response examples

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Winston & Morgan for logging
- Express-validator for validation
- Swagger for API documentation

## API Documentation

Once the server is running, you can access the Swagger documentation at:

```bash
http://localhost:3000/api-docs
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd feature-flag-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file in the root directory:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/featureflags
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

```bash
POST /api/auth/register - Register a new user
POST /api/auth/login - Login user
GET /api/auth/me - Get current user
```

### Feature Flag Routes

```bash
GET /api/flags - Get all feature flags
POST /api/flags - Create new feature flag
GET /api/flags/:id - Get specific feature flag
PUT /api/flags/:id - Update feature flag
DELETE /api/flags/:id - Delete feature flag
```

### User Management Routes

```bash
GET /api/users - Get all users (Admin only)
GET /api/users/:id - Get specific user (Admin only)
PUT /api/users/:id - Update user (Admin only)
DELETE /api/users/:id - Delete user (Admin only)
```

## Error Handling

The API implements centralized error handling with proper HTTP status codes and error messages. Common error responses:

- 400: Bad Request (Invalid input)
- 401: Unauthorized (Invalid/missing token)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Security Features

1. **Rate Limiting**

   - 100 requests per 15 minutes per IP

2. **Security Headers**

   - Implemented using Helmet middleware
   - XSS protection
   - Prevention of clickjacking
   - Strict Transport Security

3. **Request Validation**
   - Input validation using express-validator
   - MongoDB injection prevention
   - Request sanitization

## Logging

Logs are stored in the `logs` directory:

- `error.log`: Error logs only
- `combined.log`: All logs
