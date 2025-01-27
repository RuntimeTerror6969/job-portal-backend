const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resume: { type: String }, // Store the filename of the uploaded resume
  status: { type: String, enum: ['applied', 'interview', 'rejected', 'accepted'], default: 'applied' }
});

module.exports = mongoose.model('Application', applicationSchema);
