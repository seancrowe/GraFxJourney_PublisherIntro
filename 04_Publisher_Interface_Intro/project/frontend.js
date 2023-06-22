// Import PublisherInterface library
import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';
import {fakeDatabaseGetDocument} from "./utilities.js"
var publisher;
async function main(PublisherInterface) {
    document.addEventListener("DOMContentLoaded", async () => {
        const loadScreen = document.getElementById("loadingScreen");
        const editorScreen = document.getElementById("editorScreen");

        const varInput = document.getElementById("varInput");
        const varUpdateButton = document.getElementById("updateVariablesButton");
        //grab API key from env variables
        const cache = fakeDatabaseGetDocument("cache");
        let APIKEY = cache.envuserkey.value;
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
            loadScreen.setAttribute("style", "display:none");
            editorScreen.setAttribute("style", "display:flex");

            varUpdateButton.addEventListener("click", async() => {
                await publisher.setProperty('document.variables[TestVar]', 'value', varInput.value);
            })
        });
        window.publisherInterface = publisher;
    });
}
main(PublisherInterface);