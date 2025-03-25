const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  topic: { type: String, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
});

module.exports = mongoose.model("Ticket", ticketSchema);