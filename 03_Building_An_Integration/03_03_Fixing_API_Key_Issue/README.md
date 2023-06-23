# Fixing API Key Issue
⚠️ We have a problem. We don't want to generate a new key every time we call `getDocumentsFromBackOffice`. Remember how this function is called:

```
User loads the store.html page
    |
    |--> store page calls an endpoint on server.js
                    |
                    |--> server.js calls getDocumentsFromBackOffice() in backend.js
                                    |
                                    |--> getDocumentsFromBackOffice() returns an array of documents
```

This means every time the store page is loaded, the `getDocumentsFromBackOffice` would be called, and thus generating an API key every page reload.

That is not good. Generating a bunch of API keys will cause performance issues. 

## Fixing API key generation issue
We can solve this problem by caching our API keys.

The easiest way to cache API keys for this learning course is to store them in our pretend database. Remember we created a `database.json` file at the beginning of this chapter, so now lets open it and add in some values for our database.

```json
{
    "cache": {
        "enduserkey": {
            "value": "",
            "created": "0"
        },
        "envuserkey": {
            "value":"",
            "created": "0"
        }
    }
}
```

In a NoSQL database `cache` would be a new document with two properties: enduser-key and envuser-key. We are treating this JSON file as our database, which will store the value of the key and the timestamp when it was created.

So in our `getDocumentsFromBackOffice` function we would update our API key generation to include grabbing the key from the cache and checking to see if the key was created 4 hours.

Why 4 hours? Publisher API keys actually are valid for longer than 4 hours, for most environments it will be 8 hours. When you generate a key, there is an attribute in the XML will that will give you when the key is no longer valid (based on the server timezone). However, to makes things simple, we can just cache keys for 4 hours.

Lets import `fakeDatabaseGetDocument` from `utilities.js`. This is just a function that opens up our JSON file and returns the property passed.

```js
import {fakeDatabaseGetDocument} from "./utilities.js";
```

Then we can use the method in our function:
```js
export async function getDocumentsFromBackOffice(path) {

    try {

        const cache = fakeDatabaseGetDocument("cache");

        const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
        
        let apiKey = cache.envuserkey.value;

        if (Math.abs(cache.envuserkey.created - Date.now()) > fourHourInMilliseconds) {
            apiKey = await generateAPIKey({ 
                baseURL: baseURL, 
                userName: envUserCredentials.name, 
                password: envUserCredentials.password, 
                environment: envUserCredentials.environment
            });
        }

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
            const isFolder = item.getAttribute("isFolder") === "true";

            if (isFolder || id == "") {
                return null;
            }

            return { id, name };
        }).filter(Boolean);

        return items;
    }
    catch(e){

    }
}
```

We can also add this logic to our `getAPIKeyForUser` function because it is also bad for performance to generate a new key for every login.

```js
export async function getAPIKeyForUser(username) {

    try {

        const cache = fakeDatabaseGetDocument("cache");

        const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
        
        let apiKey = cache.enduserkey.value;

        if (Math.abs(cache.enduserkey.created - Date.now()) > fourHourInMilliseconds) {
            apiKey = await generateAPIKey({ 
                baseURL: baseURL,
                userName: endUserCredentials.name, // Using a variable instead
                password: endUserCredentials.password, // Using a variable instead
                environment: endUserCredentials.environment // Using a variable instead
            });
        }

        return {
            username: username,
            apiKey: apiKey
        }
    }
    catch(e) {
        throw e;
    }
}
```

Top round this out, if you do it twice, and you will do it again, we should take this logic out and create a new function that handles this same logic for us.

## Simplifying our fix of API key generation issue
Let's remove the generation logic from `getDocumentsFromBackOffice` and `getAPIKeyForUser` and make it more generic.

First we copy the logic from `getDocumentsFromBackOffice` to a new function `getAPIKey`.

```js
// This function does not work yet, we just copied and pasted.
function getAPIKey(credentials, documentEntry) {
    const cache = fakeDatabaseGetDocument("cache");

    const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
    
    let apiKey = cache.envuserkey.value;

    if (Math.abs(cache.envuserkey.created - Date.now()) > fourHourInMilliseconds) {
        apiKey = await generateAPIKey({ 
            baseURL: baseURL, 
            userName: envUserCredentials.name, 
            password: envUserCredentials.password, 
            environment: envUserCredentials.environment
        });
    }
}
```

Our new function `getAPIKey` has two properties: credentials and documentEntry.

- credentials - An object that has three properties: name, password, and environment.
- documentEntry - A string that takes the document name in our fake database.

So, our new function signature looks like:
```ts
(credentials: {name:string, password: string, environment:string}, documentEntry:string) => string
```

Let's update the body of the function by changing `envUserCredentials` to `credentials` and `cache.envuserkey` to `cache[documentEntry]`:

```js
function getAPIKey(credentials, documentEntry) {
    const cache = fakeDatabaseGetDocument("cache");

    const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
    
    let apiKey = cache[documentEntry].value;

    if (Math.abs(cache[documentEntry].created - Date.now()) > fourHourInMilliseconds) {
        apiKey = await generateAPIKey({ 
            baseURL: baseURL, 
            userName: credentials.name, 
            password: credentials.password, 
            environment: credentials.environment
        });
    }
}
```

Great! Now we can update `getDocumentsFromBackOffice` and `getAPIKeyForUser` to use this more generic `getAPIKey` function.

Updated getDocumentsFromBackOffice:
```js
export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = getAPIKey(envUserCredentials, "envuserkey");

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
            const isFolder = item.getAttribute("isFolder") === "true";

            if (isFolder || id == "") {
                return null;
            }

            return { id, name };
        }).filter(Boolean);

        return items;
    }
    catch(e){

    }
}
```

Updated getAPIKeyForUser:
```js
export async function getAPIKeyForUser(username) {

    try {

        const apiKey = getAPIKey(endUserCredentials, "enduserkey");

        return {
            username: username,
            apiKey: apiKey
        }
    }
    catch(e) {
        throw e;
    }
}
```

### 🧪 Test store still working

TODO

<br/>

----

We fixed our API key issue, but we still have the preview issue. In [Section 04]() we will fix the preview issue so our end user can see a preview of the document to select.
