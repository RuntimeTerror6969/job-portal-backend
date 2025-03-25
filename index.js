const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();

// CORS configuration for development
const corsOptions = {
  origin: "*", // Frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true, 
};

app.use(cors(corsOptions));


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});


app.post("/api/send-email", (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: "your-email@gmail.com", // Sender address
    to, // Recipient (Biotechtrek.help@gmail.com)
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Failed to send email" });
    }
    console.log("Email sent:", info.response);
    res.status(200).json({ message: "Email sent successfully" });
  });
});


app.options("*", cors(corsOptions));

app.use(express.json());


const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 40000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "hello" });
});

// Import routes
const authRoutes = require("./routes/Authentication");
const jobRoutes = require("./routes/job");
const categoryRoutes = require("./routes/category");
const applicationRoutes = require("./routes/application");
const profileRoutes = require("./routes/profile");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
