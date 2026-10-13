import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';

function NavigationBar({ cartCount }) {
  const navigate = useNavigate();

  const handleCartClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token"); // Check if user is logged in

    if (!token) {
      // Agar token nahi hai toh login page par redirect karein
      navigate('/login');
    } else {
      // Agar logged in hai toh cart page par bhej dein
      navigate('/cart');
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="font-weight-bold">
          MyStore
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} to="/" className="me-3">Home</Nav.Link>
            <Nav.Link href="/cart" onClick={handleCartClick} className="position-relative d-flex align-items-center">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <Badge 
                  pill 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;