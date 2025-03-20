// service-registry.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

let services = {};

app.post('/register', (req, res) => {
    const { serviceName, localAddress } = req.body;
    services[serviceName] = localAddress;
    console.log(`Registered: ${serviceName} -> ${localAddress}`);
    res.send({ message: 'Service registered successfully!' });
});

app.get('/services', (req, res) => {
    res.json(services);
});

app.listen(port, () => {
    console.log(`Service Registry running on port ${port}`);
});
