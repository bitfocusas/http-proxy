const express = require('express');
const morgan = require("morgan");
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create Express Server
const app = express();

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = '0.0.0.0';
const API_SERVICE_URL = process.env.PROXY_URL;

app.use(morgan('dev'));

app.get(process.env.HEALTH_URI || '/health-check', (req, res, next) => {
   res.send('OK');
});

app.use(cors(process.env.CORS_DOMAIN || '*'));

app.use(createProxyMiddleware({
   target: API_SERVICE_URL,
   changeOrigin: true,
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
   console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
