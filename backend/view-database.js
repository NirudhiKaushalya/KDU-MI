// View MongoDB Atlas Database Contents
require("dotenv").config();
const mongoose = require("mongoose");

const Admin = require("./models/admin");
const User = require("./models/userModel");
const Patient = require("./models/patient");
const Medicine = require("./models/medicine");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://prashastha03_db_user:HFDvFBdB6k5e4fHs@cluster0.h6zgw1h.mongodb.net/kdu-medical-unit?retryWrites=true&w=majority&appName=Cluster0";

async function viewDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...\n");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!\n");

    // Count documents
    const adminCount = await Admin.countDocuments();
    const userCount = await User.countDocuments();
    const patientCount = await Patient.countDocuments();
    const medicineCount = await Medicine.countDocuments();

    console.log("📊 DATABASE OVERVIEW");
    console.log("═══════════════════════════════════════");
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log("\n📈 Collection Counts:");
    console.log(`  - Admins: ${adminCount}`);
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Patients: ${patientCount}`);
    console.log(`  - Medicines: ${medicineCount}`);
    console.log("═══════════════════════════════════════\n");

    // Show Admins
    if (adminCount > 0) {
      console.log("👨‍💼 ADMINS:");
      console.log("─────────────────────────────────────");
      const admins = await Admin.find().lean();
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ID: ${admin.adminId} | Name: ${admin.adminName} | Email: ${admin.email || 'N/A'}`);
      });
      console.log();
    }

    // Show Users
    if (userCount > 0) {
      console.log("👤 USERS:");
      console.log("─────────────────────────────────────");
      const users = await User.find().lean();
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.userName} | Index: ${user.indexNo} | Email: ${user.email}`);
        console.log(`   Role: ${user.role} | Department: ${user.department}`);
      });
      console.log();
    }

    // Show Patients
    if (patientCount > 0) {
      console.log("🏥 PATIENTS:");
      console.log("─────────────────────────────────────");
      const patients = await Patient.find().lean();
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.name} (ID: ${patient.id})`);
        console.log(`   Index: ${patient.indexNo} | Age: ${patient.age} | Gender: ${patient.gender}`);
        console.log(`   Condition: ${patient.condition}`);
        if (patient.prescribedMedicines && patient.prescribedMedicines.length > 0) {
          console.log(`   Medicines: ${patient.prescribedMedicines.map(m => `${m.name} (${m.quantity})`).join(', ')}`);
        }
      });
      console.log();
    }

    // Show Medicines
    if (medicineCount > 0) {
      console.log("💊 MEDICINES:");
      console.log("─────────────────────────────────────");
      const medicines = await Medicine.find().lean();
      medicines.forEach((medicine, index) => {
        console.log(`${index + 1}. ${medicine.medicineName} (ID: ${medicine.id})`);
        console.log(`   Category: ${medicine.category} | Brand: ${medicine.brand || 'N/A'}`);
        console.log(`   Quantity: ${medicine.quantity} | Stock Level: ${medicine.stockLevel}`);
        console.log(`   Expiry: ${medicine.expiryDate}`);
      });
      console.log();
    }

    console.log("═══════════════════════════════════════");
    console.log("✅ Database view complete!\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

viewDatabase();



