# Adding Previews
The store page is showing our templates from the BackOffice, but there is no previews.

The reason there is no previews is because I lied to you. Really `server.js` expects `getDocumentsFromBackOffice` to return a signature like:
```ts
(path:string) => Promise<{name:string, id:string, previewURL:string}[]>
```
Right now our function `getDocumentsFromBackOffice` in `backend.js` looks like this:
```js
export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = getAPIKey(envUserCredentials, "envuserkey");

        const tree = await resourceGetTreeLevel({
            apiKey,
            baseURL,
            "Documents",
            path,
            1,
            true,
            true})

        const xmlDoc = (new DOMParser()).parseFromString(tree, "text/xml");

        const itemElements = xmlDoc.getElementsByTagName("item");

        const items = Array.from(itemElements).map((item) => {
            const id = item.getAttribute("id");
            const name = item.getAttribute("name");
            const isFolder = item.getAttribute("isFolder") === "true";

            if (!isFolder) {
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

Since we are not providing that `previewURL`, we get no previews.

If you remember from [Section 02](), the elements in the XML returned by `resourceGetTreeLevel` actually contains an `iconURL` property. However there are two reasons to not use this for previews:
- Without modification, the `iconURL` has our `envUser` API key, which would be very bad to leak.
- Even if we replace the API key with our `endUser` API key, the endpoint used in the iconURL has some known bugs.

Instead what we are going to do is create our own preview endpoint which will actually `downloadAsset` from `chiliBackOfficeInterface.js`.

## Creating our custom endpoint
Luckily, `server.js` has an endpoint already `/api/getdocumentpreview/{id}` which calls the function `getDocumentPreview` from `backend.js`.

So `server.js` is expecting `getDocumentPreview` to have the function signature:
```ts
(documentID:string) => Promise<ReadableStream>
```

`Stream` is an interesting type. Imagine you have a huge bucket of water that you need to pour into another bucket. Instead of trying to lift the entire heavy bucket and pour all the water at once, it would be easier if you had a small cup to scoop out the water and pour it bit by bit. That way, you can manage the pouring process without getting tired or spilling water everywhere.

In programming, nodejs streams work similarly. They help you handle large amounts of data without overwhelming your computer's memory or causing slow performance. Instead of loading all the data at once, streams allow you to process it in small pieces, just like pouring the water with a cup.

So `server.js` is expecting a `ReadableStream`, which is a specific type of `Stream` that can only be read from.

Luckily, our `downloadAssets` function provides the `ReadableStream` for us.

Lets write our first version of the function `getDocumentPreview`.

```js
async function getDocumentPreview(documentID) {
  throw "not implemented yet"
}
```

We need to import `downloadAssets` so we can use it in our function. At the top of `backend.js`, add `downloadAssets` to the import.

```js
import {downloadAssets, generateAPIKey, resourceGetTreeLevel} from `./chiliBackOfficeInterface.js`
```

Now we are ready to use our `downloadAssets` function in `getDocumentPreview`. First lets add `downloadAssets` with some dummy data.

```js
export async function getDocumentPreview(documentID) {
  try {
    return await downloadAssets({
       apiKey: "", 
       baseURL: "", 
       resourceType: "", 
       id: "", 
       type: ""
    })
  }
  catch(e) {
    throw e;
  }
}
```
Let's update our function with real data:
- We can replace apiKey with the value from `getAPIKey` function using the `envUserCredentials` object.
- We can replace the baseURL with the variable `baseURL`.
- resourceType will be "Documents".
- id will be `documentID`.
- type we can replace with "low", "medium", "high", or "highest". The best option for our use case would be "medium"

```js
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
    throw e
  }
}
```

## Update getDocumentsFromBackOffice with our own preview URL
Now that we have a function, we can add a previewURL to `getDocumentsFromBackOffice` in `backend.js`.

```js
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
            const previewURL = "/api/getdocumentpreview/" + id; // We generate the previewURL
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
```

<br/>

### 🧪 Test previews loading

TODO

----

Congrats, you have an almost working store that shows templates from the BackOffice. However, if you click the Edit you get a missing error message. In the next section, [Section 05](), we will fix that issue.