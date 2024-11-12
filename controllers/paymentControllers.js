const axios = require('axios');

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    const response = await axios.post(
      'https://api.paymongo.com/v1/payment_intents',
      {
        data: {
          attributes: {
            amount: amount * 100, 
            payment_method_allowed: ['gcash'],
            payment_method_options: { gcash: {} },
            currency: currency || 'PHP',
          },
        },
      },
      {
        auth: {
          username: PAYMONGO_SECRET_KEY,
          password: '', 
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating Payment Intent:', error.response?.data || error.message);
    res.status(500).json({ message: 'Payment Intent creation failed' });
  }
};

exports.attachPaymentMethod = async (req, res) => {
    try {
      const { paymentIntentId, phoneNumber } = req.body;
  
      const response = await axios.post(
        `https://api.paymongo.com/v1/payment_methods`,
        {
          data: {
            attributes: {
              type: 'gcash',
              billing: {
                phone: phoneNumber,
              },
            },
          },
        },
        {
          auth: {
            username: PAYMONGO_SECRET_KEY,
            password: '',
          },
        }
      );
  
      const paymentMethodId = response.data.data.id;
  
      const paymentIntentAttachResponse = await axios.post(
        `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
        {
          data: {
            attributes: {
              payment_method: paymentMethodId,
            },
          },
        },
        {
          auth: {
            username: PAYMONGO_SECRET_KEY,
            password: '',
          },
        }
      );
  
      res.status(200).json(paymentIntentAttachResponse.data);
    } catch (error) {
      console.error('Error attaching Payment Method:', error.response?.data || error.message);
      res.status(500).json({ message: 'Payment Method attachment failed' });
    }
  };
  

  exports.handleWebhook = async (req, res) => {
    const event = req.body;
  
    if (event.data && event.data.attributes) {
      const { type, data } = event;
      const { status, reference_number } = data.attributes;
  
      if (type === 'payment_intent.succeeded' && status === 'succeeded') {
        console.log('Payment succeeded:', reference_number);
      }
  
    }
  
    res.status(200).json({ message: 'Webhook received successfully' });
  };
  