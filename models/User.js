const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employer', 'candidate', 'admin'], required: true },
    phone: { type: String },
    skills: { type: [String], default: [] },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, 
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

module.exports  = mongoose.model('User', userSchema);

