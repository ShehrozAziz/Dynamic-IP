require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

// JSONBin.io settings
const BIN_ID = 'proces.env.JSONBIN_BIN_ID'; // replace with your JSONBin Bin ID
const API_KEY = 'proces.env.JSONBIN_API_KEY'; // replace with your JSONBin API key
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Register service
app.post('/register', async (req, res) => {
    const { serviceName, localAddress } = req.body;

    try {
        // Fetch existing services first
        const response = await axios.get(BASE_URL + '/latest', {
            headers: { 'X-Master-Key': API_KEY }
        });

        let services = response.data.record || {};
        services[serviceName] = localAddress;

        // Update the JSON bin
        await axios.put(BASE_URL, services, {
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY,
                'X-Bin-Versioning': false
            }
        });

        res.json({ message: 'Service registered successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to register service.' });
    }
});

// Get all services
app.get('/services', async (req, res) => {
    try {
        const response = await axios.get(BASE_URL + '/latest', {
            headers: { 'X-Master-Key': API_KEY }
        });
        res.json(response.data.record);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch services.' });
    }
});

// Home route
app.get('/', (req, res) => {
    res.send('Service Registry using JSONBin.io');
});

app.listen(port, () => {
    console.log(`Service Registry running on port ${port}`);
});
