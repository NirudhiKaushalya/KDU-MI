require("dotenv").config();//load env very first
const express = require("express");//hadle server and APIs paths
const mongoose = require("mongoose");//connect MD manage to schemas and models
const cors = require("cors");//allow APIs to access different frontend
const adminRoutes = require("./routes/adminRoutes");
const deletionRequestRoutes = require("./routes/deletionRequestRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const medicineRoutes =require("./routes/medicineRoutes");
const notificationRoutes =require("./routes/notificationRoutes");
const patientRoutes = require("./routes/patientRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");


const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());//accept json request

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test endpoint to verify file serving
app.get('/test-uploads', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, 'uploads');
  
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

// Set default environment variables if not provided
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kdu-medical-unit";
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Server will continue without MongoDB connection");
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));