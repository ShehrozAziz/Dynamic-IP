import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.get('/connection-token', async (req, res) => {
    try {
        const connectionToken = await stripe.terminal.connectionTokens.create();
        return res.status(200).json({ secret: connectionToken.secret });
    } catch (error) {
        console.error('Error creating connection token:', error.message);
        return res.status(500).json({ error: 'Failed to create connection token' });
    }
});

router.post('/create-payment-intent', async (req, res) => {
    const { amount, currency } = req.body;
    console.log(amount, currency);

    if (!amount || !currency) {
        return res.status(400).json({ error: 'Amount and currency are required' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ['card'],
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe error:', err.message);
        res.status(500).json({ error: err.message });
    }
});
router.post('/test', async (req, res) => {
    try {
        const { message } = req.body;
        console.log('Received test message:', message);
        res.status(200).json({ success: true, reply: `Received your message: ${message}` });
    } catch (error) {
        console.error('Test endpoint error:', error.message);
        res.status(500).json({ error: 'Test endpoint failed' });
    }
});

router.post('/capture-payment-intent', async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({ error: 'paymentIntentId is required' });
    }

    try {
        // First retrieve the paymentIntent to check its status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Check if paymentIntent is ready for capture
        if (paymentIntent.status !== 'requires_capture') {
            return res.status(400).json({
                error: `Cannot capture PaymentIntent with status: ${paymentIntent.status}. Must be 'requires_capture'.`
            });
        }

        // Now capture
        const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

        return res.status(200).json(capturedPaymentIntent);
    } catch (error) {
        console.error('Error capturing PaymentIntent:', error.message);
        return res.status(500).json({ error: 'Failed to capture PaymentIntent' });
    }
});


router.patch('/update-payment-intent', async (req, res) => {
    let { paymentIntentId, amount } = req.body;
    amount = parseInt(amount);
    amount = amount * 100;
    try {
        const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
            amount: parseInt(amount),
        });
        return res.status(200).json(paymentIntent);
    } catch (error) {
        console.error('Error updating PaymentIntent:', error.message);
        return res.status(500).json({ error: 'Failed to update PaymentIntent' });
    }
});

export default router;
