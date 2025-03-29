import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Home.css';
import Navbar from '../components/Navbar';

const Home = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="home-container">
      <Navbar />
      <div
        className={`toggle-button ${theme}`}
        onClick={toggleTheme}
      >
        <span>{theme === 'light' ? '☀️' : '🌙'}</span>
      </div>
      <Row className="ms-0 pe-1 h-100">
        <Col md={2} className="bg-cardColour pb-3 filter-column text-textColour">
          <h4>Filters</h4>
          <Form>
            <Form.Group controlId="filter1">
              <Form.Label>Filter 1</Form.Label>
              <Form.Control type="text" placeholder="Enter filter 1" className="input-box" />
            </Form.Group>
            <Form.Group controlId="filter2">
              <Form.Label>Filter 2</Form.Label>
              <Form.Control type="text" placeholder="Enter filter 2" className="input-box" />
            </Form.Group>
            <Form.Group controlId="filter3">
              <Form.Label>Filter 3</Form.Label>
              <Form.Control type="text" placeholder="Enter filter 3" className="input-box" />
            </Form.Group>
            <Form.Group controlId="genre">
              <Form.Label>Genre</Form.Label>
              <div className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="genre1"
                  label="Humor"
                />
                <Form.Check 
                  type="checkbox"
                  id="genre2"
                  label="Romance novel"
                />
                <Form.Check 
                  type="checkbox"
                  id="genre3"
                  label="Satire"
                />
                <Form.Check 
                  type="checkbox"
                  id="genre4"
                  label="Science Fiction"
                />
                <Form.Check 
                  type="checkbox"
                  id="genre5"
                  label="Fantasy"
                />
              </div>
            </Form.Group>
          </Form>
        </Col>
        <Col md={10}>
          <Row>
            <Col md={4}>
              <Card className="flex-row position-relative  bg-cardColour" style={{ color: 'var(--textColour)' }}>
                <Button variant="light" className="position-absolute top-0 end-1 m-2 p-1">
                  <FaHeart color="red" />
                </Button>
                <Card.Img variant="top" src="/images/bookimage.jpg" style={{ width: '100%', height: '50%', objectFit: 'fill' }} />
                <Card.Body className="p-3 bg-cardColour">
                  <ul className="list-none p-0">
                    <li><strong>Title:</strong> The Great Escape From Woodlands Nursing Home</li>
                    <li><strong>Author:</strong> Joanna Nell</li>
                    <li><strong>Genre:</strong> Humor, Romance novel, Satire</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="flex-row position-relative  bg-cardColour" style={{ color: 'var(--textColour)' }}>
                <Button variant="light" className="position-absolute top-0 end-1 m-2 p-1">
                  <FaHeart color="red" />
                </Button>
                <Card.Img variant="top" src="/images/bookimage.jpg" style={{ width: '100%', height: '50%', objectFit: 'fill' }} />
                <Card.Body className="p-3 bg-cardColour">
                  <ul className="list-none p-0">
                    <li><strong>Title:</strong> The Great Escape From Woodlands Nursing Home</li>
                    <li><strong>Author:</strong> Joanna Nell</li>
                    <li><strong>Genre:</strong> Humor, Romance novel, Satire</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="flex-row position-relative  bg-cardColour" style={{ color: 'var(--textColour)' }}>
                <Button variant="light" className="position-absolute top-0 end-1 m-2 p-1">
                  <FaHeart color="red" />
                </Button>
                <Card.Img variant="top" src="/images/bookimage.jpg" style={{ width: '100%', height: '50%', objectFit: 'fill' }} />
                <Card.Body className="p-3 bg-cardColour">
                  <ul className="list-none p-0">
                    <li><strong>Title:</strong> The Great Escape From Woodlands Nursing Home</li>
                    <li><strong>Author:</strong> Joanna Nell</li>
                    <li><strong>Genre:</strong> Humor, Romance novel, Satire</li>
                  </ul>

                  
                </Card.Body>
              </Card>
            </Col>
            
          </Row>
          
        </Col>
      </Row>

    </div>
  );
};

export default Home;