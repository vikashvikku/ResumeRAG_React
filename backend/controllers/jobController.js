const Job = require('../models/Job');

// Create a new job
exports.createJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search jobs (basic text search)
exports.searchJobs = async (req, res) => {
  try {
    const query = req.params.query;
    const jobs = await Job.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Advanced search jobs with filters
exports.advancedSearchJobs = async (req, res) => {
  try {
    const { 
      title, 
      company, 
      location, 
      minSalary, 
      maxSalary, 
      jobType, 
      skills,
      experienceLevel
    } = req.query;

    // Build search query
    const searchQuery = {};
    
    if (title) searchQuery.title = { $regex: title, $options: 'i' };
    if (company) searchQuery.company = { $regex: company, $options: 'i' };
    if (location) searchQuery.location = { $regex: location, $options: 'i' };
    if (jobType) searchQuery.jobType = jobType;
    
    // Handle salary range
    if (minSalary || maxSalary) {
      searchQuery.salary = {};
      if (minSalary) searchQuery.salary.$gte = Number(minSalary);
      if (maxSalary) searchQuery.salary.$lte = Number(maxSalary);
    }
    
    // Handle skills (array matching)
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      searchQuery.skills = { $in: skillsArray };
    }
    
    // Handle experience level
    if (experienceLevel) {
      searchQuery.experience = { $regex: experienceLevel, $options: 'i' };
    }
    
    const jobs = await Job.find(searchQuery).sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error in advanced job search:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};