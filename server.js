const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const btoa = require('btoa');
const bodyParser = require('body-parser');

const app = express();

// Configure middle tier
const targetScheme = "http";
const targetHost = "localhost";
const targetPort = 8000;
const proxyPort = 7777;

// http-proxy-middleware options, including MarkLogic backend target to MarkLogic
const proxy = createProxyMiddleware({
    target: targetScheme + '://' + targetHost + ':' + targetPort + '/',
    changeOrigin: true,
    // Transform request
    onProxyReq: (proxyReq, req) => {
        // Handle basic authentication
        proxyReq.setHeader(
            'Authorization',
            `Basic ${btoa('admin:admin')}`
        );
        // Transform request body back from text
        const { body } = req;
        if (body) {
            if (typeof body === 'object') {
                proxyReq.write(JSON.stringify(body));
            } else {
                proxyReq.write(body);
            }
        }
    },
    // Transform response
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer.toString('utf8'); // Convert buffer to string

        // EXAMPLE: Add an entityType property to results
        let parsed = JSON.parse(response);
        parsed.entityType = "person";

        return JSON.stringify(parsed);
    }),
});

// Parse the JSON body
app.use(bodyParser.text({ type: 'application/x-ndjson' }));

// Optionally do extra stuff before sending requests to backend,
// for example verify access tokens
app.use((req, res, next) => {
    const { body } = req;
    console.log('Verifying requests ✔', body);
    // Call next, express proceeds to the next middleware function, our proxy middleware
    next();
})

// Proxy all requests to MarkLogic backend using above options
app.use('*', proxy);

app.listen(proxyPort, () => console.log('Server running at http://localhost:' + proxyPort + ' 🚀'));
