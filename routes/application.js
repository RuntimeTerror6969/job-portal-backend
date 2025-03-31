const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const { verifyToken } = require("../middleware/Auth");

// Apply for job using a resume link (Google Drive URL)
router.post("/apply-job/:jobId", verifyToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const candidateId = req.user.id;

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      candidate: candidateId,
      job: jobId,
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ msg: "You have already applied for this job" });
    }

    // Validate that a resume link is provided
    const { resume } = req.body;
    if (!resume) {
      return res.status(400).json({ msg: "Resume link is required" });
    }

    // Find the job and validate it exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if job is still accepting applications
    // if (job.status !== "active") {
    //   return res
    //     .status(400)
    //     .json({ msg: "This job is no longer accepting applications" });
    // }

    // Create and save the application
    const application = new Application({
      candidate: candidateId,
      job: jobId,
      resume: resume, // now a link instead of a file path
      status: "pending", // initial status
      appliedDate: new Date(),
    });
    await application.save();

    // Populate job and candidate details in the response
    const populatedApplication = await Application.findById(application._id)
      .populate("job", "title companyName")
      .populate("candidate", "name email");

    res.status(201).json({
      msg: "Application submitted successfully",
      application: populatedApplication,
    });
  } catch (err) {
    console.error("Application submission error:", err);
    res
      .status(500)
      .json({ msg: "Error submitting application", error: err.message });
  }
});

// Get all applications for a candidate
router.get("/my-applications", verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate("job", "title companyName location salary")
      .sort({ appliedDate: -1 });
    
    // Transform dates to ISO string format before sending
    const formattedApplications = applications.map(app => ({
      ...app.toObject(),
      appliedDate: app.appliedDate.toISOString(),
      createdAt: app.createdAt ? app.createdAt.toISOString() : null
    }));
    
    res.json(formattedApplications);
  } catch (err) {
    console.error("Fetch applications error:", err);
    res
      .status(500)
      .json({ msg: "Error fetching applications", error: err.message });
  }
});

// View applications for a specific job (admin/employer only)
router.get("/view-applications/:jobId", verifyToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check user authorization
    const user = await User.findById(req.user.id);
    if (
      user.role !== "admin" &&
      job.employer.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Get applications with populated candidate info
    const applications = await Application.find({ job: jobId })
      .populate("candidate", "name email")
      .populate("job", "title companyName")
      .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (err) {
    console.error("View applications error:", err);
    res
      .status(500)
      .json({ msg: "Error fetching applications", error: err.message });
  }
});

// Get all applications (admin only)
router.get("/all-applications", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    // Get all applications with populated info
    const applications = await Application.find()
      .populate("candidate", "name email")
      .populate("job", "title companyName")
      .sort({ appliedDate: -1 });

    // Transform dates to ISO string format
    const formattedApplications = applications.map(app => ({
      ...app.toObject(),
      appliedDate: app.appliedDate.toISOString(),
      createdAt: app.createdAt ? app.createdAt.toISOString() : null
    }));

    res.json(formattedApplications);
  } catch (err) {
    console.error("Fetch all applications error:", err);
    res
      .status(500)
      .json({ msg: "Error fetching applications", error: err.message });
  }
});

// Update application status (admin/employer only)
router.patch("/update-status/:applicationId", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.applicationId;

    // Optional: Validate that the provided status is one of the allowed values.
    const allowedStatuses = ["pending", "reviewed", "accepted", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid status provided" });
    }

    const application = await Application.findById(applicationId).populate(
      "job"
    );
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Check authorization
    const user = await User.findById(req.user.id);
    if (
      user.role !== "admin" &&
      application.job.employer.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Update status and save
    application.status = status;
    await application.save();

    res.json({ msg: "Application status updated", application });
  } catch (err) {
    console.error("Update status error:", err);
    res
      .status(500)
      .json({ msg: "Error updating application status", error: err.message });
  }
});

module.exports = router;
