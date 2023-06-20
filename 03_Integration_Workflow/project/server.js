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

        return;
      });
    }
  }
  else {
    const url = (req.url == "/" || req.url == "/authentication") ? "/store" : req.url;

    const fileName = (url.includes(".js")) ? url : `${url}.html`;

    try {
      const content = fs.readFileSync(`${publicPath}${fileName}`);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
      return;
    }
    catch(err) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end(`No ${req.url} found.`);
        console.error(err);
        return;
    }
  }
 
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

