require("dotenv").config();//load env very first

// Debug: Check if email env variables are loaded
console.log('=== Environment Variables Check ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Configured ✓' : 'NOT SET ✗');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configured ✓' : 'NOT SET ✗');
console.log('===================================');

const express = require("express");//hadle server and APIs paths
const mongoose = require("mongoose");//connects to MongoDB and manages data models
const cors = require("cors");//allow APIs to access different frontend
const adminRoutes = require("./routes/adminRoutes");
const deletionRequestRoutes = require("./routes/deletionRequestRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const medicineRoutes =require("./routes/medicineRoutes");
const notificationRoutes =require("./routes/notificationRoutes");
const patientRoutes = require("./routes/patientRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const bmiRoutes = require("./routes/bmiRoutes");


const multer = require("multer");
const path = require("path");

const app = express(); //Initializes the Express application
app.use(cors()); //allows frontend (React) to talk to backend
app.use(express.json());//allows server to read JSON data from requests

/*Makes files inside uploads/ accessible via URL
Example: http://localhost:8000/uploads/image.jpg */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve profile images
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));

//A test API to verify if the uploads folder is accessible
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, 'uploads');
  
  //Reads all files inside the uploads directory
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Could not read uploads directory', details: err.message });
    }
    
    res.json({ 
      message: 'Uploads directory accessible',
      files: files,
      uploadsPath: uploadsDir
    });
  });
});

app.use("/api/admin", adminRoutes);//define endpoint
app.use("/api/deletionRequest", deletionRequestRoutes);
app.use("/api/medicalRecord", medicalRecordRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bmi", bmiRoutes);

// Set default environment variables if not provided
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://gonapinuwalanirudhi_db_user:C4CpHkdXcM2kj3GT@cluster0.0nbpffx.mongodb.net/kdu-medical-unit?retryWrites=true&w=majority";
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here"; //Used to sign and verify JWT tokens

//Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Server will continue without MongoDB connection");
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));