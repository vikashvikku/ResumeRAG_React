const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  skills: [{
    type: String
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  resumeFile: {
    type: String,
    required: true
  },
  parsedText: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
ResumeSchema.index({ 
  name: 'text', 
  skills: 'text', 
  parsedText: 'text',
  'experience.title': 'text',
  'experience.company': 'text',
  'experience.description': 'text'
});

module.exports = mongoose.model('Resume', ResumeSchema);