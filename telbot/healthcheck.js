// Simple health check server for Cloud Run
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});
