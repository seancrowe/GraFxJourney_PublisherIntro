// Import PublisherInterface library
import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';
import {outputDocument} from '../backend.js'

var publisher;
export async function main(apiKey, baseURL, environment, documentID) {

    const loadScreen = document.getElementById("loadingScreen");
    const editorScreen = document.getElementById("editorScreen");

    const varInput = document.getElementById("varInput");
    const varUpdateButton = document.getElementById("updateVariablesButton");
    //const saveButton = document.getElementById("saveButton");
    const outputPDFButton = documentID.getElementById("outputPDFButton");

    // Will have to replace with a better document
    const editorURL = `${baseURL}/${environment}/editor_html.aspx?doc=${documentID}&apiKey=${apiKey}&fullWS=false`;
    
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
            console.log("Updating variables...");
            await publisher.setProperty('document.variables[Title]', 'value', varInput.value);
        })

        outputPDFButton.addEventListener("click", async() => {
            console.log("outputting PDF...");
            let docXML = await publisher.executeFunction('document', 'GetTempXML');

            const pdfURL = await outputDocument(docXML);
            document.open(pdfURL);
        })

    });
    window.publisherInterface = publisher;

}
