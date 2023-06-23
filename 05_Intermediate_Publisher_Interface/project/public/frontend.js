// Import PublisherInterface library
import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';

export async function main(apiKey, baseURL, environment, documentID) {

    const userName = document.getElementById("user");
    const password = document.getElementById("pass");
    const loginButton = document.getElementById("login");

    const var1Input = document.getElementById("updateVariable1");
    const var2Input = document.getElementById("updateVariable2");
    const updateVarsButton = document.getElementById("updateVariablesButton");
    const saveButton = document.getElementById("saveButton");

    const loadScreen = document.getElementById("loadingScreen");
    const editorScreen = document.getElementById("editorScreen");

    // Do this cleaner, it's ugly putting everything behind this; throw publisher logic in its own funciton that runs on this
    // Will have to replace with a better document
    const editorURL = `${baseURL}/${environment}/editor_html.aspx?doc=${documentID}&apiKey=${apiKey}&fullWS=false`;
    
    // Build PublisherInterface, adjust window size here
    const iframe = document.getElementsByTagName("iframe")[0];
    iframe.style.width = "720px";
    iframe.style.height = "720px";
    iframe.src = editorURL;
    const publisherPromise = PublisherInterface.build(iframe, { penpalDebug: true });
    const publisher = await publisherPromise;

    // Place document logic in this listener to ensure the CHILI document is fully loaded and rendered before trying any operations
    publisher.addListener("DocumentFullyRendered", async () => {
        loadScreen.setAttribute("style", "display:none");
        editorScreen.setAttribute("style", "display:flex");

        console.log("hi")

        varUpdateButton.addEventListener("click", async() => {
            await publisher.setProperty('document.variables[TestVar]', 'value', varInput.value);
        })
    });
    window.publisherInterface = publisher;


    updateVarsButton.addEventListener("click", async () => {
        //await publisher.setProperty("document.variables[firstVar]", "value", var1Input.value(?));
    });

    //Through API
    saveButton.addEventListener("click", async () => {
        let docXML = await publisher.executeFunction("document", "GetTempXML");
        
        const resp = await fetch("/api/savedocument", {
            method:"POST",
            body: JSON.stringify({
                id:documentID,
                xml:docXML
            })
        });

        if(resp.ok) {
            //SAVE YEAH!!!!
            alert("Save Successful")
        }
        else {
            console.log(resp.status);
            alert("Save Failed");
        }

    })
    window.publisherInterface = publisher;

}
main(PublisherInterface);