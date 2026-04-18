import { useState } from "react";
import { FaCreditCard } from "react-icons/fa";
import PropTypes from "prop-types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function UpgradeModal({ onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleStripePayment = async () => {
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/user/stripe/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Payment processing failed");
      }

      const data = await response.json();

      if (data.message === "Storage already upgraded") {
        onClose();
        return;
      }

      if (!data.url) {
        throw new Error("Stripe checkout URL was not created");
      }

      // Redirect to Stripe Checkout (replaces deprecated redirectToCheckout)
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>Upgrade Your Storage</h2>
          <p>Get more space for your files</p>
        </div>

        <div className="pricing-container">
          <div className="pricing-plan current">
            <h3>Current Plan</h3>
            <p className="plan-size">5 MB</p>
            <p className="plan-price">Free</p>
            <p className="plan-desc">Your current storage limit</p>
          </div>

          <div className="pricing-separator">→</div>

          <div className="pricing-plan upgrade">
            <div className="plan-badge">Popular</div>
            <h3>Pro Plan</h3>
            <p className="plan-size">10 MB</p>
            <p className="plan-price">
              <span className="currency">$</span>
              <span className="amount">4.99</span>
              <span className="period">/month</span>
            </p>
            <ul className="plan-features">
              <li>✓ 10 MB Storage</li>
              <li>✓ Priority Support</li>
              <li>✓ Advanced Sharing</li>
            </ul>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-upgrade"
            onClick={handleStripePayment}
            disabled={isProcessing}
          >
            <FaCreditCard className="btn-icon" />
            {isProcessing ? "Processing..." : "Upgrade Now"}
          </button>
        </div>

        <p className="security-note">
          💳 Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}

UpgradeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default UpgradeModal;
