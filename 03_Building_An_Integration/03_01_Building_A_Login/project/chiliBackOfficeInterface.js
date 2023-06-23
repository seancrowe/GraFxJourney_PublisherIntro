import {fetch} from "cross-fetch";
import {DOMParser} from "@xmldom/xmldom";

// TODO:
//  -Finish these out
//  -Leave brief explanations of endpoints that weren't covered in the main lesson
//  -Re: error handling -- Maybe just have it on generateAPIKey for now (this isn't a general web dev course, they should know
//      how to generally do that sort of thing coming in; not our responsibility to teach)

//GenerateAPIKey
export async function generateAPIKey({baseURL, userName, password, environment}) {
    try {
        // Endpoint for generate API key found in swagger: https://ft-nostress.chili-publish.online/swagger/ui/index#!/System/RestApi_GenerateApiKey
        const response = await fetch(`${baseURL}/rest-api/v1.2/system/apikey?environmentNameOrURL=${environment}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                // We have to check if the userName is an empty string, because if it is, the endpoint will return status 400
                "userName": (userName == "") ? " " : userName,
                // We have to check if the password is an empty string, because if it is, the endpoint will return status 400
                "password": (password == "") ? " " :  password
            })
        })

        // You get any error status if your write the body correctly, and you provide the query parameter
        // We stop the 400 that would be caused by an empty password
        if (!response.ok) {
            
        }

        const responseXmlString = await response.text();

        // API key will return XML with "succeeded={true/false}", if that is false then have to check errorMessage
        const responseDoc = (new DOMParser()).parseFromString(responseXmlString, "application/xml");
        if (responseDoc.firstChild.getAttribute("succeeded") != "false") {
            return responseDoc.firstChild.getAttribute("key");
        }
        else {
            throw "credentials are wrong";
        }
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}

//ResourceGetTreeLevel
export async function resourceGetTreeLevel({apiKey, baseURL, resourceName, parentFolder, numLevels, includeSubDirectories, includeFiles}) {
    const response = await fetch(`${baseURL}/rest-api/v1.2/resources/${resourceName}/treelevel?parentFolder=${parentFolder}&numLevels=${numLevels}&includeSubDirectories=${includeSubDirectories}&includeFiles=${includeFiles}`, {
        method: "GET",
        headers: {
            "api-key": apiKey
        }
    });

    //error handling off response code here
    //maaayyybbbe not an error, but if the parent folder doesn't exist, you get a 200 with an empty tree
    //500 for incorrect resourceType
    //won't error unless you say the resourceName is "hello" or something like that
}

//DownloadAssets - preview
export async function downloadAssets({ apiKey, baseURL, resourceType, id, type }) {
    const response = await fetch(`${baseURL}/rest-api/v1.2/resources/${resourceType}/download?id=${id}&type=${type}&async=false`, {
        method: "GET",
        headers: {
            "api-key": apiKey
        }
    });

    //error handling off response code here
    if(!response.ok){
        //404 not found if ID doesn't exist
        //500 - resource not found if resourceType isn't correct

    }

}

//add in a section for Get/SetVariableValues

//DocumentCreatePDF
export async function documentCreatePDF({apiKey, baseURL, itemID, settingsXML}) {
    const response = await fetch(`${baseURL}/rest-api/v1.2/resources/documents/${itemID}/representations/pdf`, {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            "settingsXML": settingsXML
        })
    });

    //error handling here
    //400, body is wrong
    //500 if settingsXML string isn't valid XML
    //500, object reference not instance of object if you put in a non-string for settingsXML
}

//DocumentCreateTempPDF
export async function documentCreateTempPDF({apiKey, baseURL, settingsXML, docXML}) {
    const response = await fetch(`${baseURL}/rest-api/v1.2/resources/documents/tempxml/pdf`, {
        method: "POST",
        headers: {
            "api-key": apiKey,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            "settingsXML": settingsXML,
            "docXML": docXML
        })
    });

    //error handling here
    //400, body is wrong
    //500, XML given isn't valid


}

//TaskGetStatus
export async function taskGetStatus({apiKey, baseURL, taskID}) {
    const response = await fetch(`${baseURL}/rest-api/v1.2/system/tasks/${taskID}/status`, {
        method: "GET",
        headers: {
            "api-key": apiKey
        }
    });

    const body = await response.text();
    const succeeded = (new DOMParser()).parseFromString(body, "text/xml").getElementsByTagName("task")[0].getAttribute("succeeded");

    if(succeeded == "true"){ //is this true or True?
        //check the result URL, if it's empty have to account for that
        //if((new DOMParser()).parseFromString(body, "text/xml").getElementsByTagName("task")[0].getAttribute("result") //what's the result attribute actually called?
    }
    else{
        //it broked
    }

    //error handling here
    //everything's a 200, failures only show up in the XML (unless they don't, i.e. success w/ no URL)
}