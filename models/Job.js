const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String},
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: { type: String },  
  salary: { type: Number },  
  skillsRequired: [String],
  applyLink: { type: String },  


  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'any'],
    default: 'any' 
  },
  workExperience: {
    type: String,
    enum: ['0-1 years', '1-3 years', '3-5 years', '5 years','more than 5 years', 'Any'], 
    default: '0-1 years' 
  },
  dateOfPosting: { type: Date, default: Date.now }
});

jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
