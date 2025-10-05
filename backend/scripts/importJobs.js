const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('../models/Job');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to fetch jobs from Remotive API
async function fetchJobs() {
  try {
    console.log('Fetching jobs from Remotive API...');
    const response = await axios.get('https://remotive.com/api/remote-jobs?limit=20');
    return response.data.jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    return [];
  }
}

// Function to import jobs into database
async function importJobs() {
  try {
    const jobs = await fetchJobs();
    
    if (jobs.length === 0) {
      console.log('No jobs fetched. Exiting...');
      process.exit(0);
    }
    
    console.log(`Fetched ${jobs.length} jobs. Importing to database...`);
    
    // Process each job
    for (const job of jobs) {
      // Check if job already exists
      const existingJob = await Job.findOne({ title: job.title, company: job.company_name });
      
      if (existingJob) {
        console.log(`Job "${job.title}" from ${job.company_name} already exists. Skipping...`);
        continue;
      }
      
      // Map job type to our schema's allowed values
      let jobType = 'Full-time';
      if (job.job_type) {
        const jobTypeMap = {
          'full_time': 'Full-time',
          'part_time': 'Part-time',
          'contract': 'Contract',
          'freelance': 'Contract',
          'internship': 'Internship'
        };
        jobType = jobTypeMap[job.job_type.toLowerCase()] || 'Full-time';
      }
      
      // Map Remotive job to our job schema
      const newJob = new Job({
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        description: job.description,
        requirements: extractRequirements(job.description),
        salary: job.salary || 'Not specified',
        jobType: jobType,
        skills: extractSkills(job.description),
        experience: extractExperienceLevel(job.description),
        applicationUrl: job.url
      });
      
      await newJob.save();
      console.log(`Imported: ${job.title} at ${job.company_name}`);
    }
    
    console.log('Job import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing jobs:', error);
    process.exit(1);
  }
}

// Helper function to extract requirements from job description
function extractRequirements(description) {
  // Simple extraction based on common patterns
  const requirementsSection = description.match(/requirements|qualifications|what you'll need|what we're looking for/i);
  
  if (requirementsSection) {
    // Extract a portion of text after the requirements heading
    const startIndex = description.indexOf(requirementsSection[0]);
    const excerpt = description.substring(startIndex, startIndex + 500);
    return excerpt.replace(/<[^>]*>/g, ' ').trim();
  }
  
  return 'See job description for details';
}

// Helper function to extract skills from job description
function extractSkills(description) {
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'CPlusPlus',
    'TypeScript', 'Angular', 'Vue.js', 'PHP', 'Ruby', 'Go', 'Rust',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git', 'REST API',
    'GraphQL', 'HTML', 'CSS', 'Sass', 'Redux', 'Express', 'Django',
    'Flask', 'Spring', 'ASP.NET', 'React Native', 'Flutter', 'Swift',
    'Kotlin', 'Android', 'iOS'
  ];
  
  const skills = [];
  const descriptionText = description.replace(/<[^>]*>/g, ' ');
  
  for (const skill of commonSkills) {
    // Special case for C++ which causes regex issues
    if (skill === 'CPlusPlus') {
      if (descriptionText.includes('C++')) {
        skills.push('C++');
      }
      continue;
    }
    
    try {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(descriptionText)) {
        skills.push(skill);
      }
    } catch (error) {
      console.log(`Error with skill ${skill}: ${error.message}`);
    }
  }
  
  return skills.length > 0 ? skills : ['Not specified'];
}

// Helper function to extract experience level
function extractExperienceLevel(description) {
  const descriptionText = description.toLowerCase().replace(/<[^>]*>/g, ' ');
  
  if (descriptionText.includes('senior') || descriptionText.includes('sr.') || 
      descriptionText.includes('lead') || descriptionText.includes('principal') ||
      descriptionText.includes('5+ years') || descriptionText.includes('7+ years') ||
      descriptionText.includes('10+ years')) {
    return 'Senior';
  } else if (descriptionText.includes('mid') || descriptionText.includes('intermediate') ||
             descriptionText.includes('3+ years') || descriptionText.includes('2-5 years')) {
    return 'Mid-level';
  } else if (descriptionText.includes('junior') || descriptionText.includes('entry') || 
             descriptionText.includes('graduate') || descriptionText.includes('0-2 years') ||
             descriptionText.includes('1+ year')) {
    return 'Entry-level';
  }
  
  return 'Not specified';
}

// Run the import
importJobs();