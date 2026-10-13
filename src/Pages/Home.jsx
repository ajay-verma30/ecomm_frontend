import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import NavigationBar from '../Components/Navbar';

function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Local storage se initial cart count load karein
  const [cartCount, setCartCount] = useState(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    return savedCart.length;
  });

  const limit = 10;

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const fetchProducts = async (pageNum) => {
    try {
      setLoading(true);
      const result = await axios.get(`http://localhost:5000/api/v1/products?page=${pageNum}&limit=${limit}`);
      const productList = result.data.data || [];
      setProducts(productList);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Existing cart items nikalein ya empty array banayein
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Naya product cart me add karein
    const updatedCart = [...existingCart, product];
    
    // Local storage me update karein
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    
    // State update karein taaki navbar ka badge turant update ho
    setCartCount(updatedCart.length);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  return (
    <>
      <NavigationBar cartCount={cartCount} />

      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Product Catalog</h2>
          <span className="text-muted">Page: {page}</span>
        </div>

        {loading && products.length === 0 ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <Row>
              {products.length > 0 ? (
                products.map((product) => (
                  <Col key={product.id} md={4} lg={3} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 d-flex flex-column">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="h6 mb-0 text-dark font-weight-bold">{product.title}</Card.Title>
                          <Badge bg={product.stock > 0 ? "success" : "danger"} className="ms-2">
                            {product.stock > 0 ? `Stock: ${product.stock}` : "Out of Stock"}
                          </Badge>
                        </div>

                        <Card.Text className="text-muted small mb-3 flex-grow-1">
                          {product.description}
                        </Card.Text>

                        <div className="text-muted small mb-3">
                          <strong>SKU:</strong> {product.sku}
                        </div>

                        <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                          <span className="h5 text-success mb-0 font-weight-bold">₹{product.price}</span>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            disabled={product.stock <= 0}
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col className="text-center py-5">
                  <p className="text-muted">No products found on this page.</p>
                </Col>
              )}
            </Row>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handlePrev} 
                disabled={page === 1 || loading}
              >
                Previous Page
              </Button>
              
              <span className="font-weight-bold">Page {page}</span>

              <Button 
                variant="outline-primary" 
                onClick={handleNext} 
                disabled={products.length < limit || loading}
              >
                Next Page
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
}

export default Home;