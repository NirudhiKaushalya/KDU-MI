# KDU Medical Unit - Full Stack Application

A comprehensive medical management system with a React frontend and Node.js/Express/MongoDB backend for managing patients, medicines, medical records, and reports.

## 🚨 Important: Why Data Doesn't Show After Cloning

**If someone clones this project from GitHub, they won't see your data. This is NORMAL!**

### Why This Happens:
- Your data is stored in a **MongoDB database** on your local computer
- Git only stores **code files**, not database contents
- Each developer who clones the project starts with an **empty database**
- This is standard practice for web applications

### Solutions:

**Option 1: Use MongoDB Atlas (BEST for Teams)** ⭐
- Everyone connects to the same cloud database
- All team members see the same data automatically
- No need to export/import or run seed scripts
- **See [MONGODB-ATLAS-SETUP.md](MONGODB-ATLAS-SETUP.md) for step-by-step guide**

**Option 2: Run Seed Script (For Local Development)**
- After cloning, run `npm run seed` in backend folder
- Creates sample data for testing
- Each person has their own separate database

---

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (installed and running)
- **npm** package manager

---

## 🚀 Quick Setup for New Developers

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd KDU-MI-UNIT
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy and paste this content)
# Create a file named .env in the backend folder with:
MONGO_URI=mongodb://localhost:27017/kdu-medical-unit
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-here

# Start MongoDB (make sure it's running)
# Windows: mongod
# Mac/Linux: sudo systemctl start mongod

# Seed the database with sample data (IMPORTANT!)
npm run seed

# Start the backend server
npm run dev
```

Backend will run on: `http://localhost:8000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd my-app1

# Install dependencies
npm install

# Start the frontend
npm start
```

Frontend will open at: `http://localhost:3000`

---

## 🔑 Default Credentials (After Seeding)

### Admin Login
- **Email**: `admin@kdu.com`
- **Password**: `admin123`

### User Login
- **Email**: `user@kdu.com`
- **Password**: `user123`

---

## 📁 Project Structure

```
KDU-MI-UNIT/
├── backend/                    # Node.js/Express Backend
│   ├── controllers/            # Request handlers
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── uploads/                # File uploads
│   ├── seed.js                 # Database seeding script
│   ├── server.js               # Entry point
│   └── package.json
│
└── my-app1/                    # React Frontend
    ├── src/
    │   ├── components/         # Reusable components
    │   │   ├── auth/           # Authentication components
    │   │   ├── common/         # Common UI components
    │   │   ├── modals/         # Modal dialogs
    │   │   └── sections/       # Main sections
    │   ├── contexts/           # React contexts
    │   ├── styles/             # Global styles
    │   └── App.js              # Main app component
    └── package.json
```

---

## 🎯 Features

### Admin Features
- 👥 **Patient Management**: Add, edit, view, admit/discharge patients
- 💊 **Medicine Inventory**: Track stock, expiry dates, suppliers
- 📋 **Medical Records**: Manage patient medical history
- 📊 **Reports**: Upload and view lab reports (PDF)
- 🔔 **Notifications**: System-wide alerts and notifications
- 📈 **Dashboard**: Overview statistics and analytics
- 🗑️ **Deletion Requests**: Handle data deletion requests

### User Features
- 📱 **User Dashboard**: Personal medical information
- 📝 **Medical History**: View personal medical records
- 📄 **Reports**: Access personal lab reports
- 🔔 **Notifications**: Receive personal notifications
- ⚖️ **BMI Calculator**: Track BMI measurements

---

## 🔧 API Endpoints

### Authentication
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `POST /api/admin/login` - Admin login

### Patients
- `GET /api/patient` - Get all patients
- `POST /api/patient` - Add new patient
- `PUT /api/patient/:id` - Update patient
- `DELETE /api/patient/:id` - Delete patient

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Add new medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Medical Records
- `GET /api/medicalRecord/:patientId` - Get patient records
- `POST /api/medicalRecord` - Add new record

### Reports
- `POST /api/report/upload` - Upload lab report
- `GET /api/report/:patientId` - Get patient reports

### Notifications
- `GET /api/notification` - Get all notifications
- `POST /api/notification` - Create notification
- `PUT /api/notification/:id/read` - Mark as read

---

## 💾 Database Information

### Technology
- **MongoDB** - NoSQL database

### Collections
- `admins` - Admin users
- `users` - Regular users
- `patients` - Patient records
- `medicines` - Medicine inventory
- `medicalrecords` - Medical history
- `reports` - Lab reports
- `notifications` - System notifications
- `bmis` - BMI measurements
- `deletionrequests` - Data deletion requests

---

## 🔄 Sharing Data Between Developers

### Option 1: Seed Script (Recommended for Development)
```bash
cd backend
npm run seed
```

### Option 2: Export/Import Database

**Export your database:**
```bash
mongodump --db kdu-medical-unit --out ./database-backup
```

**Import database:**
```bash
mongorestore --db kdu-medical-unit ./database-backup/kdu-medical-unit
```

**⚠️ Note**: Don't commit database backups to Git (they can be large and contain sensitive data)

### Option 3: Shared Database
For teams, use a shared MongoDB instance (MongoDB Atlas):
1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `.env` file

---

## 🛠️ Development Commands

### Backend
```bash
npm run dev         # Start with nodemon (auto-reload)
npm run seed        # Seed database with sample data
```

### Frontend
```bash
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
```

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running: `mongod`
- Check your `MONGO_URI` in `.env` file
- Verify MongoDB is installed correctly

### "Port already in use"
- Change `PORT` in backend `.env` file
- Or kill the process using the port

### "No data showing after clone"
- Run the seed script: `npm run seed` (in backend folder)
- This populates sample data for development

### "Cannot find module" errors
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### File upload issues
- Make sure `uploads` folder exists in backend
- Check file permissions
- Verify multer configuration

---

## 📦 Dependencies

### Backend
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File uploads
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **react** - UI library
- **axios** - HTTP client (likely used)
- **scss** - Styling

---

## 🚀 Deployment

### Backend Deployment
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repository
- **DigitalOcean**: Use App Platform

### Frontend Deployment
- **Vercel**: `vercel deploy`
- **Netlify**: Connect GitHub repository
- **GitHub Pages**: Build and deploy

### Database Deployment
- **MongoDB Atlas**: Free cloud MongoDB hosting

---

## 📝 Environment Variables

### Backend `.env`
```env
MONGO_URI=mongodb://localhost:27017/kdu-medical-unit
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-here
```

### Frontend `.env` (if needed)
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Support

For questions or issues:
- Create an issue in the repository
- Contact the development team

---

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file created in backend
- [ ] Database seeded (`npm run seed`)
- [ ] Backend server running (port 8000)
- [ ] Frontend server running (port 3000)
- [ ] Can login with default credentials

---

**Remember**: After cloning, always run `npm run seed` in the backend to populate sample data!


