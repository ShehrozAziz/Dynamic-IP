require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

const BIN_ID = process.env.JSONBIN_BIN_ID; // replace with your JSONBin Bin ID
const API_KEY = process.env.JSONBIN_API_KEY; // replace with your JSONBin API key
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Register service
app.post('/register', async (req, res) => {
    const { serviceName, localAddress } = req.body;
    try {
        // Fetch existing data
        const response = await axios.get(BASE_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        let data = response.data.record;

        // Add/Update service inside "services" object
        data.services = data.services || {};
        data.services[serviceName] = localAddress;

        // Push updated data back
        await axios.put(BASE_URL, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            }
        });

        res.send({ message: 'Service registered successfully!' });
    } catch (err) {
        console.error(err.response ? err.response.data : err);
        console.log(process.env.JSONBIN_BIN_ID);
        res.status(500).send({ error: 'Failed to register service' });
    }
});


// Get all services
app.get('/services', async (req, res) => {
    try {
        const response = await axios.get(BASE_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        const data = response.data.record;

        // Only send back the "services" object
        res.json(data.services || {});
    } catch (err) {
        console.error(err.response ? err.response.data : err);
        res.status(500).send({ error: 'Failed to fetch services' });
    }
});

// Home route
app.get('/', (req, res) => {
    res.send('Service Registry using JSONBin.io');
});

app.listen(port, () => {
    console.log(`Service Registry running on port ${port}`);
});
