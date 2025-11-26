// Check connection and verify collections
require("dotenv").config();
const mongoose = require("mongoose");

console.log("📋 Environment Check:");
console.log("  MONGO_URI loaded:", process.env.MONGO_URI ? "Yes ✅" : "No ❌");
console.log("  URI (censored):", process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
console.log();

async function checkConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Host: ${mongoose.connection.host}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📁 Collections in database (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log("  (No collections yet - database is empty)");
    } else {
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
      }
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkConnection();





