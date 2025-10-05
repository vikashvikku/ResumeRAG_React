import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Home = () => {
  return (
    <Container>
      <Row className="my-4">
        <Col>
          <div className="text-center">
            <h1>ResumeRAG - Resume Search & Job Match</h1>
            <p className="lead">
              Upload resumes, post jobs, and find the perfect match using our intelligent matching algorithm
            </p>
          </div>
        </Col>
      </Row>
      
      <Row className="my-5">
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Resume Management</Card.Title>
              <Card.Text>
                Upload and manage resumes with automatic parsing and skill extraction.
              </Card.Text>
              <Button as={Link} to="/upload-resume" variant="primary">Upload Resume</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Job Postings</Card.Title>
              <Card.Text>
                Create and manage job postings with detailed requirements and skills.
              </Card.Text>
              <Button as={Link} to="/add-job" variant="primary">Post a Job</Button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Intelligent Matching</Card.Title>
              <Card.Text>
                Find the best candidates for your jobs using our advanced matching algorithm.
              </Card.Text>
              <Button as={Link} to="/jobs" variant="primary">Match Resumes</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;