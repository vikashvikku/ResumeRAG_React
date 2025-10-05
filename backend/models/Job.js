const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  experience: {
    type: String
  },
  salary: {
    type: String
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
JobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text', 
  requirements: 'text',
  skills: 'text'
});

module.exports = mongoose.model('Job', JobSchema);