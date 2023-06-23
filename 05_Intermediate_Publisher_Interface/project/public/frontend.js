// Import PublisherInterface library
import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';
var publisher;
var APIKEY;
var editorURL;
async function main(PublisherInterface) {
    window.document.addEventListener("DOMContentLoaded", async () => {
        const userName = document.getElementById("user");
        const password = document.getElementById("pass");
        const loginButton = document.getElementById("login");

        const var1Input = document.getElementById("updateVariable1");
        const var2Input = document.getElementById("updateVariable2");
        const updateVarsButton = document.getElementById("updateVariablesButton");
        const saveButton = document.getElementById("saveButton");

        const loginScreen = document.getElementById("loginScreen");
        const editorScreen = document.getElementById("editorScreen");

        // Do this cleaner, it's ugly putting everything behind this; throw publisher logic in its own funciton that runs on this
        loginButton.addEventListener("click", async () => {
            //Toggle display on some loading screen type deal
            //call generateAPIKey w/ user and pass, set APIKEY to that, for now just hardcode it
            APIKEY = 'ZYu6+9r0H8LpzUmplXj0m8PHFX13tzWo07T_SBfABX9r3lUaEPxTuzO_vyin+07FaIb9Z9EkPudSVHAWDMq1kOghplTrKm6Y';
            // Will have to replace with a better document
            editorURL = `https://ft-nostress.chili-publish.online/ft-nostress/editor_html.aspx?doc=ac78a63b-f0f3-4b7f-b7e9-066e26ad9f2d&apiKey=${APIKEY}&fullWS=false`;
            // Build PublisherInterface, adjust window size here
            const iframe = document.getElementsByTagName("iframe")[0];
            iframe.style.width = "720px";
            iframe.style.height = "720px";
            iframe.src = editorURL;
            const publisherPromise = PublisherInterface.build(iframe, { penpalDebug: true });
            publisher = await publisherPromise;

            // Place document logic in this listener to ensure the CHILI document is fully loaded and rendered before trying any operations
            publisher.addListener("DocumentFullyRendered", async () => {
                loginScreen.setAttribute("style", "display:none");
                editorScreen.setAttribute("style", "display:flex");
            });
        });

        updateVarsButton.addEventListener("click", async () => {
            //await publisher.setProperty("document.variables[firstVar]", "value", var1Input.value(?));
        });

        //Through API
        saveButton.addEventListener("click", async () => {
            let docXML = await publisher.executeFunction("document", "GetTempXML");
            //call ResourceItemSave w/ tempXML
        })
        window.publisherInterface = publisher;
    });
}
main(PublisherInterface);