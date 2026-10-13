import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../Components/Navbar';
import axios from 'axios';
import { Modal, Form } from "react-bootstrap";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);
const [addresses, setAddresses] = useState([]);
const [addressId, setAddressId] = useState("");
const [loadingAddresses, setLoadingAddresses] = useState(false);

const fetchAddresses = async () => {
    try {
        setLoadingAddresses(true);

        const token = localStorage.getItem("token");

        const response = await axios.get(
            "http://localhost:5000/api/v1/address",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setAddresses(response.data);
        setShowAddressModal(true);
    } catch (error) {
        console.error("Fetch addresses error:", error);
        alert(
            error.response?.data?.message ||
            "Unable to fetch addresses."
        );
    } finally {
        setLoadingAddresses(false);
    }
};
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, [navigate]);

  const handleRemoveItem = (indexToRemove) => {
    const updatedCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  
  
  const total =  cartItems.reduce((total, item) => total + parseFloat(item.price || 0), 0).toFixed(2);




const handleCheckout = async (selectedAddressId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    const items = cartItems.map((item) => ({
      product_id: item.id,
      quantity: item.quantity || 1
    }));

    const response = await axios.post(
      "http://localhost:5000/api/v1/order/new",
      {
        address_id: selectedAddressId,
        items
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.status === 201) {
      const orderId = response.data.data.order.id;

      navigate(`/checkout?order_id=${orderId}`, { state:{total: total}});
    }
  } catch (err) {
    console.error("Checkout error:", err);

    alert(
      err.response?.data?.message ||
      "Unable to create order."
    );
  }
};


  return (
    <>
      <NavigationBar cartCount={cartItems.length} />

      <Container className="py-4">
        <h2 className="mb-4">Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-3">Your cart is empty.</p>
            <Button variant="outline-primary" onClick={() => navigate('/')}>
              Go Shopping
            </Button>
          </div>
        ) : (
          <Row>

            <Col lg={8} className="mb-4">
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{item.title}</strong>
                        <div className="text-muted small">{item.description}</div>
                      </td>
                      <td className="text-success font-weight-bold">₹{item.price}</td>
                      <td>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between mt-3">
                <Button variant="outline-secondary" size="sm" onClick={handleClearCart}>
                  Clear Cart
                </Button>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              </div>
            </Col>

            <Col lg={4}>
              <Card className="shadow-sm border-0 p-3">
                <Card.Body>
                  <Card.Title className="h5 mb-3">Order Summary</Card.Title>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Items:</span>
                    <span>{cartItems.length}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4 font-weight-bold h5">
                    <span>Total Amount:</span>
                    <span className="text-success">₹{total}</span>
                  </div>
                  <Button
    variant="success"
    className="w-100 py-2"
    onClick={fetchAddresses}
    disabled={loadingAddresses}
>
    {loadingAddresses ? "Loading addresses..." : "Proceed to Checkout"}
</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      <Modal
    show={showAddressModal}
    onHide={() => setShowAddressModal(false)}
    centered
>
    <Modal.Header closeButton>
        <Modal.Title>Select Delivery Address</Modal.Title>
    </Modal.Header>

    <Modal.Body>
        {addresses.length === 0 ? (
            <p>No saved addresses found. Please add an address first.</p>
        ) : (
            <Form>
                {addresses.map((address) => (
                    <Form.Check
                        key={address.id}
                        type="radio"
                        name="deliveryAddress"
                        className="mb-3"
                        value={address.id}
                        checked={addressId === address.id}
                        onChange={() => setAddressId(address.id)}
                        label={`${address.address}, ${address.city}, ${address.country} - ${address.pincode}`}
                    />
                ))}
            </Form>
        )}
    </Modal.Body>

    <Modal.Footer>
        <Button
            variant="secondary"
            onClick={() => setShowAddressModal(false)}
        >
            Cancel
        </Button>

        <Button
            variant="success"
            disabled={!addressId || addresses.length === 0}
            onClick={() => {
                setShowAddressModal(false);
                handleCheckout(addressId);
            }}
        >
            Use This Address & Continue
        </Button>
    </Modal.Footer>
</Modal>
    </>
  );
}

export default Cart;