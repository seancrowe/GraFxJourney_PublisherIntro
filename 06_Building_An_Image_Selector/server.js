import http from "http";
import  fs from "fs";
import path from "path";
import {getAPIKeyForUser} from "./backend.js";
import { fileURLToPath } from "url";

const port = 3000; // Set the desired port number

const publicPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");

const server = http.createServer((req, res) => {

  if (req.headers.cookie == null) {

    if (req.url == "/authentication") {

      let body = "";

      req.on("data", (chunk) => body += chunk)

      req.on("end", () => {
        const {username} = JSON.stringify(body);
        const apiKey = getAPIKeyForUser(username);
        res.writeHead(200, { "Content-Type": "text/plain", "Set-Cookie": `key=${apiKey}; username=exampleUser; Max-Age=180` });
        res.end("Cookie Sent - You are Authorized");
      });
    }
    else {
      fs.readFile(`${publicPath}/login.html`, "utf8", (err, content) => {
        if (err) {
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end("No login page found.");
          console.error(err);
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        }
      });
    }
  }
  else {
    if (req.url == "/" || req.url == "/store" || req.url == "/authentication") {

      fs.readFile(`${publicPath}/store.html`, "utf8", (err, content) => {
        if (err) {
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end("No store found.");
          console.error(err);
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        }
      });
      
    }

    if (req.url === "/editor") {
      fs.readFile(`${publicPath}/editor.html`, "utf8", (err, content) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
          console.error(err);
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content);
        }
      });
      
    }
  }
 
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

