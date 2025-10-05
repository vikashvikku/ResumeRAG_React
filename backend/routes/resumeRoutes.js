const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function(req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF, DOC, or DOCX files are allowed!');
    }
  }
});

// Import controllers
const { 
  uploadResume, 
  getAllResumes, 
  getResumeById, 
  searchResumes,
  matchResumeToJob
} = require('../controllers/resumeController');

// Routes
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getAllResumes);
router.get('/:id', getResumeById);
router.get('/search/:query', searchResumes);
router.get('/match/:jobId', matchResumeToJob);

module.exports = router;