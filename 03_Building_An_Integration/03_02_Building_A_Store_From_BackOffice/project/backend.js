import {DOMParser} from "@xmldom/xmldom";
import {generateAPIKey, resourceGetTreeLevel} from "./chiliBackOfficeInterface.js";

const baseURL = "https://ft-nostress.chili-publish.online/";
// New object to hold our credentials
const endUserCredentials = {
    name: "endUser",
    password: "chili#Password@1234S",
    environment: "ft-nostress"
}
const envUserCredentials = {
    name: "envUser",
    password: "chili#Password@5678S",
    environment: "ft-nostress"
}

export async function getAPIKeyForUser(username) {

    try {
        const apiKey = await generateAPIKey({ 
            baseURL: baseURL,
            userName: endUserCredentials.name, // Using a variable instead
            password: endUserCredentials.password, // Using a variable instead
            environment: endUserCredentials.environment // Using a variable instead
        });

        return {
            username: username,
            apiKey: apiKey
        }
    }
    catch(e) {
        throw e;
    }
}

export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = await generateAPIKey({ 
            baseURL: baseURL, 
            userName: envUserCredentials.name, 
            password: envUserCredentials.password, 
            environment: envUserCredentials.environment
        });

        console.log("APIKEY");
        console.log(apiKey);

        const resp = await resourceGetTreeLevel({
            apiKey: apiKey,
            baseURL: baseURL,
            resourceName: "Documents",
            parentFolder: "path",
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        console.log(resp);

        // Parse the XML string
        const xmlDoc = (new DOMParser()).parseFromString(resp, "text/xml");
        
        // Get all <item> elements
        const itemElements = xmlDoc.getElementsByTagName("item");

        // Convert <item> elements to an array of objects
        const items = Array.from(itemElements).map((item) => {
            const id = item.getAttribute("id");
            const name = item.getAttribute("name");
            const isFolder = item.getAttribute("isFolder") === "true";

            // Skip items with isFolder="false"
            if (!isFolder) {
                return null;
            }

            return { id, name };
        }).filter(Boolean); // Filter out null values

        console.log(items);

        return items;
    }
    catch(e){
        console.log(e);
        throw e;
    }
}
