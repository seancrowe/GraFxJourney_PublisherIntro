import http from 'http';
import  fs from 'fs';
import path from 'path';
import {authentication} from './backend.js';
import { fileURLToPath } from 'url';

const port = 3000; // Set the desired port number

const dir = path.dirname(fileURLToPath(import.meta.url));

const indexFilePath = path.join(dir, 'public/user.html'); // Path to your index.html file

const server = http.createServer((req, res) => {

  console.log(req.url);

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

  if (req.url === '/authentication') {

    req.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });

    req.on("end", () => console.log("end"))
    //authentication()
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
