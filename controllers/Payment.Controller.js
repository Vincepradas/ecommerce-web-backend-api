const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

// Create Payment Link (GCash only)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const response = await fetch("https://api.paymongo.com/v1/links", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount,
            currency: "PHP",
            description,
            redirect: {
              success: `${process.env.FRONTEND_URL}/checkout/success?link_id={CHECKOUT_ID}`,
              failed: `${process.env.FRONTEND_URL}/checkout/failed`,
            },
          },
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || "Payment link creation failed");
    }

    res.json(data);
  } catch (error) {
    console.error("Error creating Payment Link:", error.message);
    res.status(500).json({
      message: "Payment Link creation failed",
      error: error.message,
    });
  }
};

// Verify Payment Link Status
exports.verifyPaymentLink = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(`https://api.paymongo.com/v1/links/${id}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          PAYMONGO_SECRET_KEY + ":"
        ).toString("base64")}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || "Failed to verify payment");
    }

    const status = data?.data?.attributes?.status;
    const payments = data?.data?.attributes?.payments || [];

    // Check if there's a successful payment
    const isPaid = status === "paid" || 
                   payments.some(p => p.attributes.status === "paid");

    if (isPaid) {
      return res.json({ 
        success: true, 
        status: "paid", 
        data,
        payment: payments.find(p => p.attributes.status === "paid")
      });
    }

    return res.json({ success: false, status, data });
  } catch (error) {
    console.error("Verify payment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error verifying payment",
    });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (!event.data || !event.data.attributes) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const { type, data } = event;
    const { status, payment_method_used } = data.attributes;

    switch (type) {
      case "link.payment.paid":
        console.log("GCash payment succeeded:", {
          linkId: data.id,
          status,
          paymentMethod: payment_method_used,
        });
        break;

      case "link.payment.failed":
        console.log("GCash payment failed:", {
          linkId: data.id,
          status,
        });
        break;

      default:
        console.log("Unhandled webhook event:", type);
    }

    res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};