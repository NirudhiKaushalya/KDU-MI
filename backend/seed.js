require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const Admin = require("./models/admin");
const Patient = require("./models/patient");
const Medicine = require("./models/medicine");
const User = require("./models/userModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kdu-medical-unit";

// Sample data
const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding");

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log("Clearing existing data...");
    await Admin.deleteMany({});
    await Patient.deleteMany({});
    await Medicine.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    console.log("Creating admin user...");
    await Admin.create({
      adminId: 1,
      adminName: "Admin User",
      email: "admin@kdu.com",
    });

    // Create sample user
    console.log("Creating sample user...");
    const userPassword = await bcryptjs.hash("user123", 10);
    await User.create({
      userName: "John Doe",
      indexNo: "S12345",
      gender: "Male",
      dob: "2000-01-15",
      email: "user@kdu.com",
      contactNo: "+94771234567",
      role: "Student",
      department: "Engineering",
      intake: "2020",
      password: userPassword,
      additionalNotes: "Sample user account",
    });

    // Create sample patients
    console.log("Creating sample patients...");
    await Patient.create([
      {
        id: "P001",
        indexNo: "S20001",
        name: "Jane Smith",
        age: 20,
        gender: "Female",
        condition: "Fever",
        role: "Student",
        admittedDate: "2025-01-15",
        admittedTime: "10:30 AM",
        reason: "High fever and headache",
        medicalCondition: "Viral fever",
        prescribedMedicines: [
          { name: "Paracetamol", quantity: 10 }
        ],
        additionalNotes: "Rest advised for 3 days",
      },
      {
        id: "P002",
        indexNo: "S20002",
        name: "Mike Johnson",
        age: 22,
        gender: "Male",
        condition: "Consultation",
        role: "Student",
        consultedDate: "2025-02-10",
        consultedTime: "02:15 PM",
        reasonForConsultation: "Routine checkup",
        medicalCondition: "Healthy",
        prescribedMedicines: [],
        additionalNotes: "No issues found",
      },
    ]);

    // Create sample medicines
    console.log("Creating sample medicines...");
    await Medicine.create([
      {
        id: "MED001",
        medicineName: "Paracetamol",
        category: "Pain Relief",
        brand: "PharmaCorp",
        quantity: 500,
        lowStockThreshold: 50,
        expiryDate: "2026-12-31",
        stockLevel: "In Stock",
      },
      {
        id: "MED002",
        medicineName: "Amoxicillin",
        category: "Antibiotic",
        brand: "MediSupply",
        quantity: 200,
        lowStockThreshold: 30,
        expiryDate: "2026-06-30",
        stockLevel: "In Stock",
      },
      {
        id: "MED003",
        medicineName: "Ibuprofen",
        category: "Pain Relief",
        brand: "HealthPlus",
        quantity: 15,
        lowStockThreshold: 20,
        expiryDate: "2025-12-31",
        stockLevel: "Low Stock",
      },
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("\n📊 Created:");
    console.log("  - 1 Admin (ID: 1, Email: admin@kdu.com)");
    console.log("  - 1 User (Email: user@kdu.com, Password: user123)");
    console.log("  - 2 Patients");
    console.log("  - 3 Medicines");
    
    // Wait a moment for data to be fully written, then disconnect
    await new Promise(resolve => setTimeout(resolve, 1000));
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from database");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();


