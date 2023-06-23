import {fakeDatabaseGetDocument, fakeDatabaseSetDocument} from "./utilities.js";
import {DOMParser} from "@xmldom/xmldom";
import {downloadAssets, generateAPIKey, resourceGetTreeLevel} from "./chiliBackOfficeInterface.js";

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

        const apiKey = await getAPIKey(endUserCredentials, "enduserkey");

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

        const apiKey = await getAPIKey(envUserCredentials, "envuserkey");

        const resp = await resourceGetTreeLevel({
            apiKey: apiKey,
            baseURL: baseURL,
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        const xmlDoc = (new DOMParser()).parseFromString(resp, "text/xml");

        const itemElements = xmlDoc.getElementsByTagName("item");

        const items = Array.from(itemElements).map((item) => {
            const id = item.getAttribute("id");
            const name = item.getAttribute("name");
            const previewURL = "/api/getdocumentpreview/" + id;
            const isFolder = item.getAttribute("isFolder") === "true";

            if (isFolder || id == "") {
                return null;
            }

            return { id, name, previewURL };
        }).filter(Boolean);

        return items;
    }
    catch(e){
        console.log(e);
        throw e;
    }
}

export async function getDocumentPreview(documentID) {
    try {
  
      const apiKey = await getAPIKey(envUserCredentials, "envuserkey");
  
      return await downloadAssets({
         apiKey, 
         baseURL:baseURL, 
         resourceType: "Documents", 
         id: documentID, 
         type: "medium"
      })
    }
    catch(e) {
        throw e;
    }
  }

async function getAPIKey(credentials, documentEntry) {
    const cache = fakeDatabaseGetDocument("cache");

    console.log(cache);

    const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
    
    let apiKey = cache[documentEntry].value;

    if (Math.abs(cache[documentEntry].created - Date.now()) > fourHoursInMilliseconds) {
        apiKey = await generateAPIKey({ 
            baseURL: baseURL, 
            userName: credentials.name, 
            password: credentials.password, 
            environment: credentials.environment
        });

        cache[documentEntry].value = apiKey;
        cache[documentEntry].created = Date.now();
        fakeDatabaseSetDocument("cache", cache);
    }

    return apiKey;
}