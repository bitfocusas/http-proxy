const express = require('express');
const morgan = require("morgan");
const cors = require('cors');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const fetch = require('node-fetch');

// Create Express Server
const app = express();

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const HOST = '0.0.0.0';
const API_SERVICE_URL = process.env.PROXY_URL;
const REDIRECT_ERRORS = process.env.REDIRECT_ERRORS;

const onError = (err, req, res, target) => {
	console.log("Error: ", err, target);
};

const onProxyRes = responseInterceptor(async (responseBuffer, proxyres, req, res) => {
	if (proxyres.statusCode >= 400 && proxyres.statusCode < 500 && REDIRECT_ERRORS) {
		const result = await fetch(REDIRECT_ERRORS.match(/^http/) ? REDIRECT_ERRORS : API_SERVICE_URL + REDIRECT_ERRORS);
		const headers = result.headers.raw();
		for (let key in headers) {
			res.setHeader(key, headers[key]);
		}
		const buf = await result.buffer();
		res.statusCode = result.status;
		res.statusMessage = result.statusText;
		return buf;
	} else {
		return responseBuffer;
	}
});

app.use(morgan('dev'));

app.get(process.env.HEALTH_URI || '/health-check', (req, res, next) => {
   res.send('OK');
});

app.use(cors(process.env.CORS_DOMAIN || '*'));

app.use(createProxyMiddleware({
   target: API_SERVICE_URL,
   changeOrigin: true,
   onProxyRes,
   onError,
   selfHandleResponse: true
}));

// Start the Proxy
app.listen(PORT, HOST, () => {
   console.log(`Starting Proxy at ${HOST}:${PORT}`);
});
