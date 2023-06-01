const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000; // Set the desired port number
const indexFilePath = path.join(__dirname, 'index.html'); // Path to your index.html file

const server = http.createServer((req, res) => {
  // Check if the request is for the root path
  if (req.url === '/') {
    // Read the index.html file
    fs.readFile(indexFilePath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        console.error(err);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
