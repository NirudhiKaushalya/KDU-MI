# KDU Medical Unit - Backend Setup Guide

## Prerequisites
- Node.js installed
- MongoDB installed and running

## Setup Instructions for New Developers

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd KDU-MI-UNIT/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/kdu-medical-unit
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. Start MongoDB
Make sure MongoDB is running on your machine:
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

### 5. Seed the Database (IMPORTANT!)
This will populate the database with sample data:
```bash
npm run seed
```

This creates:
- **Admin Account**: 
  - Email: `admin@kdu.com`
  - Password: `admin123`
- **User Account**: 
  - Email: `user@kdu.com`
  - Password: `user123`
- Sample patients and medicines

### 6. Start the Server
```bash
npm run dev
```

The server will run on `http://localhost:8000`

## Why Don't I See Data After Cloning?

**This is normal!** Here's why:
- Your data is stored in a **MongoDB database** on your local machine
- Git only stores **code**, not database contents
- Each person who clones the project starts with an **empty database**
- That's why we created the `seed.js` script - to populate sample data!

## Database Export/Import (For Sharing Real Data)

### Export Your Data
```bash
mongodump --db kdu-medical-unit --out ./database-backup
```

### Import Data
```bash
mongorestore --db kdu-medical-unit ./database-backup/kdu-medical-unit
```

**Note**: Don't commit database backups to Git (they can be large and contain sensitive data)

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check your MONGO_URI in `.env` file

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using port 8000

### Seed Script Errors
- Make sure MongoDB is connected
- Check if your model files have any errors





