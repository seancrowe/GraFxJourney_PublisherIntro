# Building A Store From BackOffice
Now that we are authenticated, we want to show a selection of documents to the end user to select from. We will call this our store page.

## Section Setup
To setup this section, cover the `store.html` file from the `03_Integration_Workflow/project/public` path on the git repo to your project's public folder.

Your root folder should similar to this:
- 📁node_modules
- 📂public
    - 📄login.html
    - 📄store.html
- 📄backend.js
- 📄database.json
- 📄server.js
- 📄package-lock.json
- 📄package.json

### Answer Questions

However to do this we need to answer a few questions:
- Where do our store documents live?
- How do we access them?
- How do we show that info to the frontend?

### Where will we keep our documents?
Our store documents can live in one of three places:
1. In the BackOffice. Thus being stored on your Publisher environment.
2. Externally. They would be stored on a blob storage or a file share, and you would load them using the XML related APIs.
3. Hybrid. The document IDs are stored externally in a database while the physical files are stored in the BackOffice.

There are benefits and downsides to each option, which we will review below.

| Location    | Benefits   | Downsides   | Suggested |
|-------------|------------|-------------|-----------|
| BackOffice  | The main benefit is that you can get started right away. Because everything is in a folder it is very easy to use the HTTP APIs to dynamically display documents. | If you want to use custom workspaces, view preferences, PDF export settings that change based on the document used then it is very difficult to tie these things to particular documents without a complex setup. In addition, if you require meta data for your frontend experience, such as displaying documents based on season or project, then you must use a complex folder structure which does not scale well. | ❌ No |
| Externally  | All your document XMLs are stored in your own systems which gives you complete control. | The integration is more complex as you will need to have the systems in place to store the XML as well as the ability for a designer to register a document created in CHILI in your system. | ✅ Yes |
| Hybrid      | While you do not have complete control, you do have control over the meta data, because your frontend is using your database to display and manage documents. Only the physical XML is being stored in CHILI. | The integration is more complex as it requires a database or similar to track document IDs, but less complex that being completely external. You still need to have a the ability for a designer to to register a document created in CHILI in your system. | ✅ Yes |

For this learning course, we are going to implement the BackOffice as a location, but please keep in mind that this is often times not the best solution for an integration.

<br/>

## 🏢 BackOffice setup
Because we rely on APIs that return files in a folder system, we will need to implement a folder structure that our frontend can use to display documents that are suppose to be live or documents that are stored by specific users from those documents that are still be worked on.

For this learning course, you should create two folders in the Document section of the BackOffice:
- StoreDocuments
- UserDocuments

All documents in the StoreDocuments folder will be displayed on our store page.
User documents will be stored in sub-folders in the the UserDocuments folder.
All other documents will not be known to our application.

Once you have those folders, either move or create three new documents. Make sure the documents have some type of pictures, shapes, or text in them otherwise later on your previews will look blank.

### 🤔 Why are we doing this?

Great question. If you are confused why are we calling a custom endpoint on our backend instead of just calling `ResourceGetTreeLevel` directly on the frontend or using `chiliBackOfficeInterface.js` on the frontend, then you will soon be enlighten.

The reason we should not call `ResourceGetTreeLevel` on the frontend is because on the frontend we are going to use the `endUser` user, which has limited permission. Remember setting this user up: [Setting up the end user](#setting-up-the-end-user).

This API key cannot call `ResourceGetTreeLevel`, it is not allowed.

Therefore we must use a different API key, one that has all permissions. Specially, we will use the the `envUser` key we created in [Chapter 02]().

Because this key has all the permissions, it must never leave the backend.

### Creating our new backend function

Let's create a new function in `backend.js` called `getDocumentsFromBackOffice` with a function signature:
```ts
(path:string) => {name:string, id:string}[]
```

Lets write the first version of this function.
```js
export async function getDocumentsFromBackOffice(path) {
    return [{
        name:"",
        id:""
    }]
}
```

In this case `server.js` will pass us the path being "StoreDocuments". So, all we need to do is use `resourceGetTreeLevel` method from the `chiliBackOfficeInterface.js`to get the documents in that folder and then transform the data into a JSON object to send back to the frontend.

In your `backend.js`, `chiliBackOfficeInterface.js` is already imported. At this point you should have this at the top of the file:

```js
import {generateAPIKey} from `./chiliBackOfficeInterface.js`
```

All we need to do is import the function `resourceGetTreeLevel`.

```js
import {generateAPIKey, resourceGetTreeLevel} from `./chiliBackOfficeInterface.js`
```

Now, go to the function you are writing in `backend.js` and we can add `resourceGetTreeLevel`:

```js
export async function getDocumentsFromBackOffice(path) {

    try {
        const tree = await resourceGetTreeLevel({
            apiKey: "",
            baseURL: "",
            resourceName: "",
            parentFolder: "",
            numLevels: "",
            includeSubDirectories: "",
            includeFiles: ""
        })

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```
We can then fill in the dummy values with real data.

```js
export async function getDocumentsFromBackOffice(path) {

    try {
        const tree = await resourceGetTreeLevel({
            apiKey: "apiKey",
            baseURL: "https://ft-nostress.chili-publish.online/",
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        })

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```

Alright, so lets go through each property to remind ourselves of what each one means:

- apiKey - For now we left it being the dummy value "apiKey". We are going to need to generate an API key
- baseURL - Here we hardcoded the baseURL. We also hardcoded the baseURL in the `getAPIKeyForUser` function in the same `backend.js` file. This value will be used over and over again, and in the future we may wish to change it, which would require us to find and replace. Instead, it would be wise to make this value a variable.
    - In a real application, this value would also be provided by environmental variable.
- resourceName - The resource is Documents.
- parentFolder - The path being passed into this function will be the parentFolder.
- numLevels - Here would have gone deeper than just the folder. We could go into sub-folders by making setting the value to "2". We could go into sub-sub-folder by setting the value to "3". This API endpoint, will only return the first 1000 documents, so even if you set the value to "99" there is a limit of how much it would return. However, for our BackOffice integration it might make sense to categorize are store documents into folders, and thus you would need to use a "2" instead of a "1". For this learning course, we will use a "1" and assume the documents will not be categorized into folders.
- includeSubDirectories - This is a very weird property, because it actually does two things. The first thing it does is it determined whether folders are shown in the results. The second thing it does is control if anything in sub-folders are shown. So what that means is that if you set this to "false" and set numLevels to "99", you will only get level 1 of the folder. I set this true for the learning course so we can show how to handle the folders.
- includeFiles - This is controls if files will be shown in our request, which of course that is what we want.


## Fixing constants
As described above, we are hardcoding the `baseURL` which in the long term is not a good design decision. What happens if we need to change the `baseURL` due to a change in environments.

Let's first fix our baseURL issue, in both `getAPIKeyForUser` and `getDocumentsFromBackOffice` functions we replace the hardcoded value with a variable and then add that variable to the top of the file.

```js
import {generateAPIKey, resourceGetTreeLevel} from `./chiliBackOfficeInterface.js`

// Added new variable
const baseURL = "https://ft-nostress.chili-publish.online/";

export async function getAPIKeyForUser(username) {

    try {
        const apiKey = await generateAPIKey({ 
            baseURL:baseURL, // Replaced with variable
            userName:"endUser", 
            password:"chili#Password@1234", 
            environment:"ft-nostress" 
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
        const tree = await resourceGetTreeLevel({
            apiKey: "apiKey",
            baseURL: baseURL, // Replaced with variable
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```

While we are here, let's fix `generateAPIKey` because there are some values in the `generateAPIKey` function that we may want to change in the future. Realistically these should be an environmental variables.

We will pull out the credentials for generating the end user API key and put them in an object.

```js
import {generateAPIKey, resourceGetTreeLevel} from "./chiliBackOfficeInterface.js"

const baseURL = "https://ft-nostress.chili-publish.online/";
// New object to hold our credentials
const endUserCredentials = {
    name: "endUser",
    password: "chili#Password@1234",
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
        const tree = await resourceGetTreeLevel({
            apiKey: "apiKey",
            baseURL: baseURL,
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```

We refactored our code to be cleaner, by taking values that could change and could be used across multiple methods and place them in a variable.


## Fixing permissions
Everything is looking good, but our call to `resourceGetTreeLevel` still uses a dummy API key. We need to generate an API key for `resourceGetTreeLevel` that has permissions to make this call. That would be a key for our `envUser` we setup in [Chapter 02]().

Like the `endUser` lets set the credentials in the top of the `backend.js` file. Again, we are going this because we identified these may change.
```js
import {generateAPIKey, resourceGetTreeLevel} from `./chiliBackOfficeInterface.js`

const baseURL = "https://ft-nostress.chili-publish.online/";
const endUserCredentials = {
    name: "endUser",
    password: "chili#Password@1234",
    environment: "ft-nostress"
}
const envUserCredentials = {
    name: "envUser",
    password: "chili#Password@5678",
    environment: "ft-nostress"
}
```

Now we can generate a key to be used.
```js
export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = await generateAPIKey({ 
            baseURL: baseURL, 
            userName: envUserCredentials.name, 
            password: envUserCredentials.password, 
            environment: envUserCredentials.environment
        });

        const tree = await resourceGetTreeLevel({
            apiKey: apiKey,
            baseURL: baseURL,
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```

<br/>

## Modifying resourceGetTreeLevel response
Right now our function is returning dummy data, but what we really want is any array of objects that contain a document id and name.

The function `resourceGetTreeLevel` returns an XML string that has this pattern:
```xml
<tree path="StoreDocuments">
    <item id="some id" name="some name" isFolder="true or false" ...></item>
</tree>
```

I strongly suggest before moving on, going into Swagger, see [Chapter 02](../02_HTTP_API_And_Swagger/README.md), and playing around with ResourceGetTreeLevel to get a feel for the different responses.

The `<item>` element represents either a folder or a file, and you know which by the `isFolder` property. There are other properties on the `<item>` element, but the only ones we care about are `id` and `name`.

In addition, if you are looking in sub-folders (which we are not in the learning course), you need to notice that files in folders will be placed in the XML as a `<item>` with `isFolder="false"` in a `<item>` with `isFolder="true"`.

### ⚠️ Why don't we just pass the XML along to the frontend?
This is where looking at the response of the ResourceGetTreeLevel endpoint is important. Each document `<item>` has an attribute `iconURL` which just so happens to have our API key we are using in the value. So if you passed this XML string unedited to the frontend, you just leaked your `envUser` API key and gave complete access to your Publisher environment.

### Transforming the data
Because we are not using any sub-folders the transformation from our XML string to objects with just a name and an id is rather simple. Also, because this is not a course in JavaScript, I am going to just give you the solution below, but feel free to try and come up with a solution on your own first.

Because nodejs does not come with a DOM parser, we need to add the DOMParser we downloaded in [Chapter 02](). At the top of `backend.js` add this import:
```js
import {DOMParser} from "@xmldom/xmldom";
```

With the DOM parser, we are now able to transform the data.
```js
export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = await generateAPIKey({ 
            baseURL: baseURL, 
            userName: envUserCredentials.name, 
            password: envUserCredentials.password, 
            environment: envUserCredentials.environment
        });

        const tree = await resourceGetTreeLevel({
            apiKey: apiKey,
            baseURL: baseURL,
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        // Parse the XML string
        const xmlDoc = (new DOMParser()).parseFromString(tree, "text/xml");
        
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

    }
}
```

<br/>


----

This brings us to the end of Section 02. You now have a working store to show templates from the BackOffice, but we have to problems:
- There are no previews
- Even bigger, we are generating API keys for every login and every page reload

In [Section 03]() we will fix the API key issue.
In [Section 04]() we will fix the lack of previews issue.