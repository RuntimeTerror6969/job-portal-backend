const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes'); // Directory where resumes will be uploaded
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  }
});

// Create file filter
const fileFilter = (req, file, cb) => {
  // Accept only certain file types
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only PDFs, DOCs, and DOCXs are allowed!');
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
