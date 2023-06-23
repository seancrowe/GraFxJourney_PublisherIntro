// Import PublisherInterface library
import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';

var publisher;
export async function main(apiKey, baseURL, environment, documentID) {

    const loadScreen = document.getElementById("loadingScreen");
    const editorScreen = document.getElementById("editorScreen");

    const varInput = document.getElementById("varInput");
    const varUpdateButton = document.getElementById("updateVariablesButton");

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
            await publisher.setProperty('document.variables[TestVar]', 'value', varInput.value);
        })
    });
    window.publisherInterface = publisher;

}
