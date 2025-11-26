const mongoose = require("mongoose");

const deletionRequestSchema = new mongoose.Schema(
  {
    medicalRecordId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MedicalRecord', 
      required: true 
    },
    patientIndexNo: { 
      type: String, 
      required: true 
    },
    patientEmail: { 
      type: String, 
      required: true 
    },
    adminId: { 
      type: String, 
      required: true 
    },
    adminName: { 
      type: String, 
      required: true 
    },
    reason: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'user_approved', 'user_rejected', 'admin_confirmed', 'admin_rejected'], 
      default: 'pending' 
    },
    requestedAt: { 
      type: Date, 
      default: Date.now 
    },
    userRespondedAt: { 
      type: Date 
    },
    adminConfirmedAt: { 
      type: Date 
    },
    patientResponse: { 
      type: String 
    },
    adminFinalResponse: { 
      type: String 
    },
    dismissedByPatient: { 
      type: Boolean, 
      default: false 
    },
    dismissedAt: { 
      type: Date 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeletionRequest", deletionRequestSchema);
