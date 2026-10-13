import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      const result = await axios.post("http://localhost:5000/api/v1/auth/login", { email, password });

      if (result.status === 200) {
        localStorage.setItem("token", result.data.data.token);
        navigate("/")
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials or server error.");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={5} lg={4}>
          <Card className="shadow-sm border-0 p-4">
            <Card.Body>
              
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}

              <Form onSubmit={login}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;