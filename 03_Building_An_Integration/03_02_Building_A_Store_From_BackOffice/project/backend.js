import {DOMParser} from "@xmldom/xmldom";
import {generateAPIKey, resourceGetTreeLevel} from "./chiliBackOfficeInterface.js";

const baseURL = "https://ft-nostress.chili-publish.online/";
// New object to hold our credentials
const endUserCredentials = {
    name: "endUser",
    password: "", 
    environment: "ft-nostress"
}
const envUserCredentials = {
    name: "envUser",
    password: "",
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
            apiKey: apiKey,
            environment: endUserCredentials.environment,
            baseURL: baseURL
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

        const resp = await resourceGetTreeLevel({
            apiKey: apiKey,
            baseURL: baseURL,
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        // Parse the XML string
        const xmlDoc = (new DOMParser()).parseFromString(resp, "text/xml");
        
        // Get all <item> elements
        const itemElements = xmlDoc.getElementsByTagName("item");

        // Convert <item> elements to an array of objects
        const items = Array.from(itemElements).map((item) => {
            const id = item.getAttribute("id");
            const name = item.getAttribute("name");
            const isFolder = item.getAttribute("isFolder") === "true";

            // Skip items with isFolder="false" or id is missing (for meta information)
            if (isFolder || id == "") {
                return null;
            }

            return { id, name };
        }).filter(Boolean); // Filter out null values

        return items;
    }
    catch(e){
        console.log(e);
        throw e;
    }
}
