# Toolbox AI

A Node.js application with MongoDB database integration.

## Database Migration

This project has been migrated from MySQL to MongoDB. The following changes were made:

- Replaced Sequelize ORM with Mongoose ODM
- Updated database configuration to use MongoDB URI
- Converted User model from Sequelize to Mongoose schema
- Updated environment variables for MongoDB connection

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `sample.env` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Example: `mongodb://localhost:27017/toolbox_ai`

3. Start the server:
   ```bash
   npm start
   ```

## MongoDB Connection

The application connects to MongoDB using Mongoose. The connection string format is:
```
mongodb://[username:password@]host[:port]/database_name
```

For local development, you can use:
```
mongodb://localhost:27017/toolbox_ai
```

## Models

- **User**: User model with email, password, and name fields
- Password hashing is handled automatically via Mongoose middleware
- Soft delete functionality is available via the `softDelete()` method