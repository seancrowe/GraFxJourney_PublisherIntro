// Import PublisherInterface library
 import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';
 var publisher;
 async function main(PublisherInterface) {
     document.addEventListener("DOMContentLoaded", async () => {
         const userName = document.getElementById("user");
         const password = document.getElementById("pass");
         const loginButton = document.getElementById("login");

         const loginScreen = document.getElementById("loginScreen");
         const editorScreen = document.getElementById("editorScreen");

         loginButton.addEventListener("click", async () => {
             loginScreen.setAttribute("style", "display:none");
             editorScreen.setAttribute("style", "display:flex");
             //call generateAPIKey w/ user and pass, set APIKEY to that, for now just hardcode it
             let APIKEY = 'ZYu6+9r0H8LpzUmplXj0m8PHFX13tzWo07T_SBfABX9r3lUaEPxTuzO_vyin+07FaIb9Z9EkPudSVHAWDMq1kOghplTrKm6Y';
             // Will have to replace with a better document
             const editorURL = `https://ft-nostress.chili-publish.online/ft-nostress/editor_html.aspx?doc=ac78a63b-f0f3-4b7f-b7e9-066e26ad9f2d&apiKey=${APIKEY}&fullWS=false`;
             // Build PublisherInterface, adjust window size here
             const iframe = document.getElementsByTagName("iframe")[0];
             iframe.style.width = "720px";
             iframe.style.height = "720px";
             iframe.src = editorURL;
             const publisherPromise = PublisherInterface.build(iframe, { penpalDebug: true });
             publisher = await publisherPromise;

             // Place document logic in this listener to ensure the CHILI document is fully loaded and rendered before trying any operations
             publisher.addListener("DocumentFullyRendered", async () => {
                 //some stuff
             });
         })
         window.publisherInterface = publisher;
     });
 }
 main(PublisherInterface);