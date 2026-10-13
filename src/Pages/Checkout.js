import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-result`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <div className="mb-4">
        <PaymentElement />
      </div>

      {message && (
        <Alert variant="danger" className="py-2 small">
          {message}
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-100 py-2 fw-semibold shadow-sm"
        variant="primary"
        style={{ backgroundColor: "#635bff", border: "none" }}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Processing Payment...
          </>
        ) : (
          "Pay Securely"
        )}
      </Button>

      <div className="text-center mt-3 text-muted small">
        <i className="bi bi-shield-lock-fill text-success me-1"></i>
        Payments are secure and encrypted by Stripe
      </div>
    </form>
  );
}

function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const total = location.state?.total;

  const orderId = new URLSearchParams(window.location.search).get("order_id");

  const startPayment = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/v1/payments/create-payment",
        { order_id: orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setClientSecret(response.data.clientSecret);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to start payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={7} lg={5}>
          <Card className="shadow-lg border-0 rounded-4 p-4 bg-white">
            <div className="text-center mb-4">
              <div>
                <h4>Order Summary</h4>
                <h2 className="fw-bold text-success mb-1">Total Amount: ₹{total ?? "Not available"}</h2>
              </div>
              <h3 className="fw-bold text-dark mb-1">Complete Checkout</h3>
              <p className="text-muted small">
                {orderId
                  ? `Order ID: #${orderId}`
                  : "Review your payment details"}
              </p>
            </div>

            {!orderId && (
              <Alert variant="danger" className="text-center">
                Order ID is missing from the URL.
              </Alert>
            )}

            {message && (
              <Alert variant="danger" className="text-center">
                {message}
              </Alert>
            )}

            {!clientSecret && orderId && (
              <div className="text-center py-4">
                <p className="text-muted mb-4 small">
                  Click below to initialize your secure checkout session.
                </p>
                <Button
                  onClick={startPayment}
                  disabled={loading}
                  className="w-100 py-2 fw-semibold shadow-sm"
                  variant="dark"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Preparing Checkout...
                    </>
                  ) : (
                    "Continue to Payment"
                  )}
                </Button>
              </div>
            )}

            {clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: { theme: "stripe" },
                }}
              >
                <PaymentForm orderId={orderId} />
              </Elements>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
