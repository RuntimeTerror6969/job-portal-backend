const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../config/multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { verifyToken } = require('../middleware/Auth');

// Apply for job
router.post('/apply-job/:jobId', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const candidateId = req.user.id;

    const { resume } = req.file; // Access the uploaded file
    const { resumePath } = req.file.path; // Store the path or filename

    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    
    const application = new Application({
      candidate: candidateId,
      job: jobId,
      resume: resumePath 
    });

    await application.save();
    res.status(201).json({ msg: 'Application submitted', application });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// view appilcations(for admin/employee)..

router.get('/view-applications/:jobId', verifyToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;

    
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    
//only admin/employee are allowed..

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && job.employer.toString() !== user._id.toString()) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    
    const applications = await Application.find({ job: jobId }).populate('candidate', 'name email'); 
    res.json(applications);
  } 
  
  catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
