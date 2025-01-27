const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Category = require('../models/Category'); 
const { verifyToken, isEmployerOrAdmin } = require('../middleware/Auth');

// Post new job (for employers and admins)
router.post('/post-job', verifyToken, isEmployerOrAdmin, async (req, res) => {
  try {
    const { title, description, location, category, companyName, salary, skillsRequired, employmentType, workExperience } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ msg: 'Invalid category' });

    const newJob = new Job({
      title,
      description,
      location,
      category,
      employer: req.user.id,
      companyName,
      salary,
      skillsRequired,
      employmentType,
      workExperience,
    });

    await newJob.save();
    res.status(201).send('Job posted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Retrieve all jobs with optional filters
router.get('/view-jobs', async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      salary,
      employmentType,
      workExperience,
      dateOfPosting,
    } = req.query;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = location;
    }
    if (salary) {
      query.salary = salary;
    }
    if (employmentType) {
      query.employmentType = employmentType;
    }
    if (workExperience) {
      query.workExperience = workExperience;
    }
    if (dateOfPosting) {
      const today = new Date();
      switch (dateOfPosting) {
        case '24h':
          query.dateOfPosting = { $gte: new Date(today.setDate(today.getDate() - 1)) };
          break;
        case '7d':
          query.dateOfPosting = { $gte: new Date(today.setDate(today.getDate() - 7)) };
          break;
        case '30d':
          query.dateOfPosting = { $gte: new Date(today.setDate(today.getDate() - 30)) };
          break;
        case 'all':
        default:
          break;
      }
    }

    const jobs = await Job.find(query).populate('category').populate('employer'); 
    res.json(jobs);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Retrieve jobs posted by specific employer
router.get('/my-jobs', verifyToken, isEmployerOrAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .populate('category'); 
    res.json(jobs);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update job (for employers and admins)
router.put('/update-job/:id', verifyToken, isEmployerOrAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { title, description, location, category, companyName, salary, skillsRequired, employmentType, workExperience } = req.body;

    //validate category..
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) return res.status(400).json({ msg: 'Invalid category' });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.category = category || job.category;
    job.companyName = companyName || job.companyName;
    job.salary = salary || job.salary;
    job.skillsRequired = skillsRequired || job.skillsRequired;
    job.employmentType = employmentType || job.employmentType;
    job.workExperience = workExperience || job.workExperience;

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete job (for employers and admins)
router.delete('/delete-job/:id', verifyToken, isEmployerOrAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    await Job.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Job removed' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
