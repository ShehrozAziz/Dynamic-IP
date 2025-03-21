const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

const FILE_PATH = './services.json';

// Load existing services from file (if exists)
let services = {};
if (fs.existsSync(FILE_PATH)) {
    const data = fs.readFileSync(FILE_PATH);
    services = JSON.parse(data);
    console.log('Loaded services from file:', services);
}

// Register service and update JSON file
app.post('/register', (req, res) => {
    const { serviceName, localAddress } = req.body;
    services[serviceName] = localAddress;
    console.log(`Registered: ${serviceName} -> ${localAddress}`);

    fs.writeFileSync(FILE_PATH, JSON.stringify(services, null, 2));
    res.send({ message: 'Service registered successfully!' });
});

// Service Registry Home
app.get('/', (req, res) => {
    res.send('Service Registry');
});

// Get services
app.get('/services', (req, res) => {
    res.json(services);
});

app.listen(port, () => {
    console.log(`Service Registry running on port ${port}`);
});
