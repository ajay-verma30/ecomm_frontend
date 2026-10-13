import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

function PaymentResult() {
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const clientSecret = params.get("payment_intent_client_secret");

      if (!clientSecret) {
        setStatus("unknown");
        setMessage("Payment details were not found.");
        return;
      }

      try {
        const stripe = await stripePromise;

        if (!stripe) {
          throw new Error("Stripe could not be loaded.");
        }

        const { paymentIntent, error } =
          await stripe.retrievePaymentIntent(clientSecret);

        if (error || !paymentIntent) {
          setStatus("unknown");
          setMessage("Unable to verify the payment result.");
          return;
        }

        switch (paymentIntent.status) {
          case "succeeded":
            setStatus("success");
            setMessage("Your payment was successful!");
            localStorage.removeItem("cart")
            break;

          case "processing":
            setStatus("processing");
            setMessage("Your payment is still processing.");
            break;

          case "requires_payment_method":
            setStatus("failed");
            setMessage("Payment was not completed. Please try again.");
            break;

          case "canceled":
            setStatus("failed");
            setMessage("This payment was canceled.");
            break;

          default:
            setStatus("processing");
            setMessage("We are checking your payment status.");
        }
      } catch (error) {
        console.error("Payment result error:", error);
        setStatus("unknown");
        setMessage("Unable to check payment status right now.");
      }
    };

    checkPayment();
  }, []);

  return (
    <Container className="py-5">
      <Card className="mx-auto text-center p-4" style={{ maxWidth: "500px" }}>
        {status === "checking" && (
          <>
            <Spinner animation="border" className="mx-auto mb-3" />
            <h4>Checking payment...</h4>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-success">Payment Successful!</h2>
            <p>{message}</p>
            <Button onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <h2 className="text-danger">Payment Not Completed</h2>
            <p>{message}</p>
            <Button variant="primary" onClick={() => navigate("/cart")}>
              Return to Cart
            </Button>
          </>
        )}

        {(status === "processing" || status === "unknown") && (
          <>
            <h4>Payment Status</h4>
            <p>{message}</p>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
}

export default PaymentResult;
