const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({

  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true }, 
  salary: { type: Number, required: true }, 
  skillsRequired: [String],

  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'any'], 
  },
  workExperience: {
    type: String,
    enum: ['0-1 years', '1-3 years', '3-5 years', 'more than 5 years', 'any'], 
    default: 'any'
  },
  dateOfPosting: { type: Date, default: Date.now } 
});


// Create a text index on ttile and description fields..

jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);


