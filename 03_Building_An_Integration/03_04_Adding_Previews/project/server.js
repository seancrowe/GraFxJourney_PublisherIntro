import http from "http";
import fs from "fs";
import path from "path";
import { getAPIKeyForUser, getDocumentsFromBackOffice, getDocumentPreview } from "./backend.js";
import { fileURLToPath } from "url";

const port = 3000; // Set the desired port number

const publicPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "public");

const server = http.createServer((req, res) => {

  if (req.headers.cookie == null) {

    if (req.url == "/authentication") {

      let body = "";

      req.on("data", (chunk) => body += chunk)

      req.on("end", async () => {
        try {
          const { username } = JSON.parse(body);
          const cookie = JSON.stringify(await getAPIKeyForUser(username));
          res.writeHead(200, { "Content-Type": "text/plain", "Set-Cookie": `${cookie}; Max-Age=180` });
          res.end("Cookie Sent - You are Authorized");
        }
        catch (e) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(e.toString());
          console.error(e);
        }
      });
    }
    else {
      fs.readFile(`${publicPath}/login.html`, "utf8", (err, content) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
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

    const { username } = JSON.parse(req.headers.cookie)

    const url = (req.url == "/" || req.url == "/authentication") ? "/store" : req.url;

    if (url.includes("/api/")) {
      if (url == "/api/getdocumentsfrombackoffice") {
        getDocumentsFromBackOffice("StoreDocuments")
          .then(content => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(content));
          })
          .catch(e => {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(e.toString());
            console.error(e);
          })
      }


      if (url.includes("/api/getdocumentpreview/")) {
        const urlArray = url.split("/");
        const id = urlArray[urlArray.length - 1];

        getDocumentPreview(id).then(content => {
          res.writeHead(200, { "Content-Type": "image/png" });
          content.pipe(res);
        })
      }
    }
    else {

      const fileName = (url.includes(".js")) ? url : `${url.split("?")[0]}.html`;

      try {
        const content = fs.readFileSync(`${publicPath}${fileName}`);
        res.writeHead(200, { "Content-Type": (fileName.includes(".js")) ? "text/javascript" : "text/html" });
        res.end(content);
      }
      catch (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(`No ${fileName} found.`);
        console.error(err);
      }
    }
  }

});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

