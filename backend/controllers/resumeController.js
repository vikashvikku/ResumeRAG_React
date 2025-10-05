const Resume = require('../models/Resume');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Upload and parse resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let parsedText = '';
    
    // Parse PDF if it's a PDF file
    if (req.file.mimetype === 'application/pdf') {
      const pdfFile = fs.readFileSync(path.join(uploadsDir, req.file.filename));
      const pdfData = await pdfParse(pdfFile);
      parsedText = pdfData.text;
    }
    
    // Extract basic info from parsed text (simplified)
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
    const phoneRegex = /(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/g;
    
    const email = parsedText.match(emailRegex) ? parsedText.match(emailRegex)[0] : '';
    const phone = parsedText.match(phoneRegex) ? parsedText.match(phoneRegex)[0] : '';
    
    // Extract skills (simplified approach)
    const commonSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'HTML', 'CSS', 'Python', 'Java'];
    const skills = commonSkills.filter(skill => 
      parsedText.toLowerCase().includes(skill.toLowerCase())
    );

    // Create new resume
    const resume = new Resume({
      name: req.body.name || 'Unknown',
      email: email || req.body.email,
      phone: phone || req.body.phone,
      skills: skills,
      resumeFile: req.file.path,
      parsedText: parsedText
    });

    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all resumes
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error('Error getting resumes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search resumes
exports.searchResumes = async (req, res) => {
  try {
    const query = req.params.query;
    const resumes = await Resume.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    
    res.json(resumes);
  } catch (error) {
    console.error('Error searching resumes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Match resume to job
exports.matchResumeToJob = async (req, res) => {
  try {
    const Job = require('../models/Job');
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Create a search query based on job requirements
    const searchTerms = [
      job.title,
      ...job.skills,
      ...job.requirements
    ].join(' ');
    
    // Find matching resumes
    const matchingResumes = await Resume.find(
      { $text: { $search: searchTerms } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
    
    // Calculate match percentage (simplified)
    const results = matchingResumes.map(resume => {
      // Calculate skill match percentage
      const matchedSkills = resume.skills.filter(skill => 
        job.skills.some(jobSkill => 
          jobSkill.toLowerCase() === skill.toLowerCase()
        )
      );
      
      const skillMatchPercentage = job.skills.length > 0 
        ? (matchedSkills.length / job.skills.length) * 100 
        : 0;
      
      return {
        resume,
        matchPercentage: Math.min(Math.round(skillMatchPercentage), 100)
      };
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error matching resumes to job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};