const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  resume: { type: String, required: true }, // now stores the Google Drive URL
  status: {
    type: String,
    enum: ["pending", "reviewed", "accepted", "rejected"],
    default: "pending",
  },
  appliedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);
