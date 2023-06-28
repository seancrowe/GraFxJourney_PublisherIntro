import {generateAPIKey} from "./chiliBackOfficeInterface.js"

export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ 
            baseURL: "https://ft-nostress.chili-publish.online/",
            userName: "endUser",
            password: "", //change me back before pushing changes :)
            environment: "ft-nostress"
        });

        return {
            username: username,
            apiKey: apiKey,
            environment: "ft-nostress",
            baseURL: "https://ft-nostress.chili-publish.online/"
        }
    }
    catch(e) {
        throw e;
    }
}