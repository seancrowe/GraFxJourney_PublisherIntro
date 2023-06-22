


## Chapter Setup
In your project do the following:
- Copy over the `server.js` file from the `03_Integration_Workflow/project` path on the git repo. We will not be reviewing this file as it contains code that hides away the complexity of handling request and responses. If you are really interested you can find more details in the `SERVER_README.md`.
- Create a folder called `public`. This folder will be where the script from `server.js` will server our HTML files.
- Create a file called `backend.js`. This file will contain all of our code which will be called by `server.js` to handle the logic of integrating with CHILI Publisher.
- Create a file called `database.json`. This file will act as our pretend database. We use a JSON file to keep things simple.

However, we are going to be copying a lot of HTML files from the `03_Integration_Workflow/project/public` path in the following sections. So, keep the git project files nearby.

### 🧪 Test project setup
If you setup everything correctly, you should be able to run the following command in the root of your project:

```bash
node ./server.js
```

In your terminal you will see the message.

```
Server running on port 3000
```

If you go to `http://localhost:3000` in a browser you will get a message "No login page found". 

Don't forget to `ctrl` + `c` to terminate the node process before moving onto the next section.

<br/>

⚠️ Something wrong?

- If you got a login page, that is probably because you copied some or all the HTML files from `03_Integration_Workflow/project/public`. You public folder in your project should be empty.
- If you get a message similar to `This site can’t be reached`, that usually means you forgot the port 3000. Check your URL and try again.
    - If everything in your URL looks correct, then double check to make sure your `server.js` script is running. If you see your "shell prompt" or "command prompt", then the script is not running. Potentially it may be blocked by antivirus or another server is running on port 3000. Look for any error logs.
- If you get a message similar to `This site can’t provide a secure connection`, that usually means that you are using https instead of http in your URL. Check your URL and remove the s from `https`.

If you get stuck, create an issue on github and include a link to your repo for your project up to this point.

## Login
For our simple application we will have a very basic login page. We are going to use a simple example to both generate API keys for GraFx Publisher and discuss how API keys are used on the frontend vs backend.

To start, copy over the `login.html` file from the `03_Integration_Workflow/project/public` git project folder to your project `public` folder.

This is a very simple HTML file that has a button which will call our backend. Specifically the only JavaScript in the HTML is a simple call to our server. What is going to happen is when you "login", the username and password will be passed to `server.js` which will then call the function `getAPIKeyForUser` from our `backend.js` script.

### Creating the getAPIKeyForUser function
So, we need to add a function in our `backend.js` named `getAPIKeyForUser`. The signature for this function will be:
```ts
(username:string) => {username:string, apiKey:string}
```

So we can write the first version of our function to match that signature.
```js
export async function getAPIKeyForUser(username) {

    return {
        username: username,
        apiKey: ""
    }
}
```

Of course we are only passing back a blank API key, so we need to now add logic to get a real API key and send it back to `server.js`.

Of course, we can generate an API key really easily with our `chiliBackOfficeInterface.js` file using the `generateAPIKey` function.

Let's import the file, and call the function with some dummy data.

```js
import {generateAPIKey} from `./chiliBackOfficeInterface.js`

export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ "baseURL", "userName", "password", "environment" });

        return {
            username: username,
            apiKey: ""
        }
    }
    catch(e) {
        throw e;
    }
}
```

Great! But now we need to fill in some actual data to generate an API key.

To make things simple, you can hardcode the values in the function.

```js
import {generateAPIKey} from `./chiliBackOfficeInterface.js`

export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ "https://ft-nostress.chili-publish.com/", "endUser", "chili#Password@1234", "ft-nostress" });

        return {
            username: username,
            apiKey: ""
        }
    }
    catch(e) {
        throw e;
    }
}
```

However, in real life you will want to pull these values from an environment variable. Feel free to implement that on your own, but we will continue hardcoding the values in this example project.

You will notice that we are using a user called `endUser`. The reason being is that this API key will be used only on the front end, which means that we will want to setup a user with very little permissions. The reason is that this key will be used in the Publisher editor URL, and thus anyone will be able to take the key and use it.

So lets first setup this special user.

### Setting up the end user
📝 need to explain the correct permissions and get BackOffice pictures

### Finishing our function - almost
Now we can finish our function but simply returning the apiKey in our function return.

Notice we have a `try/catch` block. If something goes wrong, we can throw the error and `server.js` which is call this function will handle the error properly responding with a 500.
```js
export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ "https://ft-nostress.chili-publish.com/", "endUser", "chili#Password@1234", "ft-nostress" });

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
Also notice that as long as nothing goes wrong, we response with an API key. This is because we are not actually do anything authentication. In real life you would probably do a database lookup, but this is an example application, and we just accept any user with any password.

Finally, notice that we use the same GraFx Publisher user for all our project users. This is because it is better to think of the API key user not as user but as a token with permissions. Your application may have hundreds of users, but each one will map to only one API user.

### 🧪 Test login
Alright if you have done everything correctly, you should be able to just run the following command in your project:

```bash
node server.js
```

Then go to `http://localhost:3000`and you will see a login page.

Type in a username and password, and press _Login_, the page will reload and you will see an error message: "No store found."

Great! This is exactly what we wanted to happen. Don't forget to `ctrl` + `c` to terminate the node process before moving onto the next section.

<br/>

⚠️ Something wrong?

- If you get a message similar to `This site can’t be reached` or `This site can’t provide a secure connection` see [Test project setup](#Test-project-setup).
- If you do not get a login page, make sure you copied `login.html` file from the project path `03_Integration_Workflow/project/public`to your `public` folder. Your root folder should similar to this:
    - 📁node_modules
    - 📂public
        - 📄login.html
    - 📄backend.js
    - 📄database.json
    - 📄server.js
    - 📄package-lock.json
    - 📄package.json
- If you do not get the error message "No store found." but instead get an site with a blue navigation at the top, then you probably copied over too many files from `03_Integration_Workflow/project/public` to your project's `public` folder. Please see the above root folder diagram. Your `public` folder should only have one file in it: `login.html`.
    

If you get stuck, create an issue on github and include a link to your repo for your project up to this point.

### Quick overview
A quick overview of what is happening

```
Frontend User -> Application Page

   |    (not authenticated)
   V
Server.js -> Login Page (login.html)

   |    (enters username and password)
   V
Frontend User -> Presses "Login"

   |    (sends credentials)
   V
Frontend -> Backend (Server.js) -> getAPIKeyForUser

   |    (generates API key using generateAPIKey)
   V
Backend -> Frontend: Username and API Key (set on cookie)

   |    (page reloads)
   V
Frontend -> Reloads Page (sends new cookie)

   |    (server.js reads cookie)
   V
Server.js -> Pushes Frontend User to Store Page (store.html)
```

## Store Page

Now that we are authenticated, we want to show a selection of documents to the end user to select from. We will call this our store page.

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

For this learning course, we are going to implement first the BackOffice as a location and then move over to the Hybrid model.

### 🏢 BackOffice setup
Because we rely on APIs that return files in a folder system, we will need to implement a folder structure that our frontend can use to display documents that are suppose to be live or documents that are stored by specific users from those documents that are still be worked on.

For this learning course, you should create two folders in the Document section of the BackOffice:
- StoreDocuments
- UserDocuments

All documents in the StoreDocuments folder will be displayed on our store page.
User documents will be stored in sub-folders in the the UserDocuments folder.
All other documents will not be known to our application.

Once you have those folders, either move or create three new documents. Make sure the documents have some type of pictures, shapes, or text in them otherwise later on your previews will look blank.

### Making our frontend show documents
Create a file in root of our project folder of your project named `frontend.js`. All the JavaScript we will use will be pulled from `frontend.js` by our HTML pages.

The store.html page is expecting a function called `renderStoreDocumentsFromBackOffice` which has a function signature like so:
```ts
() => {id:string, name:string, previewURL:string}[]
```

This function takes the `apiKey` string and returns an array of objects that contain the document id and preview URL of the document.

We can create the first version of our function in the `frontend.js` filled with some dummy data:
```js
export async renderStoreDocumentsFromBackOffice() {
    return [{
        id:"",
        name:"test",
        previewURL:"https://fastly.picsum.photos/id/925/200/300.jpg"
    }]
}
```

### 🧪 Test dummy document in store
Run the following command in the root directory of your project.

```bash
node ./server.js
```

In your terminal you will see the message.

```
Server running on port 3000
```

If you go to `http://localhost:3000` you will get a login page. Login in with whatever user you wish and the store page should load with single document card and a random image from picsum.

<br/>

⚠️ Something wrong?

- If you get a message similar to `This site can’t be reached` or `This site can’t provide a secure connection` see [Test project setup](#Test-project-setup).
- If you only see a blank store with no document cards, then there are four most likely scenarios:
    - You did not properly place your `frontend.js` file in your `public` folder
    - You misnamed the `frontend.js` file.
    - You misnamed the `renderStoreDocumentsFromBackOffice` function in the `frontend.js` file.
    - You forgot to export `renderStoreDocumentsFromBackOffice` in the `frontend.js` file.

If you get stuck, create an issue on github and include a link to your repo for your project up to this point.



### Making our store show documents from the StoreDocuments folder
Great that we have a dummy document, but we need to show documents from the BackOffice in the StoreDocuments folder.

To accomplish this, we will need to have our `renderStoreDocumentsFromBackOffice` function call an endpoint on our backend. The endpoint on our backend will then call the  `resourceGetTreeLevel` method from the `chiliBackOfficeInterface.js` file to and return to us a list of documents.

In this case, `server.js` is expecting you to call the endpoint `/api/getdocumentsfrombackoffice`.

This endpoint was created in `server.js` and all it does is pass the request onto a function in our `backend.js` called `getDocumentsFromBackOffice`.

__🤔 Why are we doing this?__ 

Great question. If you are confused why are we calling a custom endpoint on our backend instead of just calling `ResourceGetTreeLevel` directly on the frontend or using `chiliBackOfficeInterface.js` on the frontend, then you will soon be enlighten.

The reason we should not call `ResourceGetTreeLevel` on the frontend is because on the frontend we are going to use the `endUser` user, which has limited permission. Remember setting this user up: [Setting up the end user](#setting-up-the-end-user).

This API key cannot call `ResourceGetTreeLevel`, it is not allowed.

Therefore we must use a different API key, one that has all permissions. Specially, we will use the the `envUser` key we created in Chapter 02.

Because this key has all the permissions, it must never leave the backend.

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
            "apiKey",
            "baseURL",
            "resourceName",
            "parentFolder",
            "numLevels",
            "includeSubDirectories",
            "includeFiles"})

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
            "apiKey",
            "https://ft-nostress.chili-publish.com/",
            "Documents",
            path,
            1,
            true,
            true})

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```

Alright, so lets go through each property:

- apiKey - For now we left it being the dummy value "apiKey". We are going to need to generate an API key
- baseURL - Here we hardcoded the baseURL. We also hardcoded the baseURL in the `getAPIKeyForUser` function in the same `backend.js` file. This value will be used over and over again, and in the future we may wish to change it, which would require us to find and replace. Instead, it would be wise to make this value a variable.
    - In a real application, this value would also be provided by environmental variable.
- resourceName - The resource is Documents.
- parentFolder - The path being passed into this function will be the parentFolder.
- numLevels - Here would have gone deeper than just the folder. We could go into sub-folders by making setting the value to "2". We could go into sub-sub-folder by setting the value to "3". This API endpoint, will only return the first 1000 documents, so even if you set the value to "99" there is a limit of how much it would return. However, for our BackOffice integration it might make sense to categorize are store documents into folders, and thus you would need to use a "2" instead of a "1". For this learning course, we will use a "1" and assume the documents will not be categorized into folders.
- includeSubDirectories - This is a very weird property, because it actually does two things. The first thing it does is it determined whether folders are shown in the results. The second thing it does is control if anything in sub-folders are shown. So what that means is that if you set this to "false" and set numLevels to "99", you will only get level 1 of the folder. I set this true for the learning course so we can show how to handle the folders.
- includeFiles - This is controls if files will be shown in our request, which of course that is what we want.


### Fixing constants
Let's first fix our baseURL issue, in both functions replace the hardcoded value with a variable and then add that variable to the top of the file.

```js
import {generateAPIKey, resourceGetTreeLevel} from `./chiliBackOfficeInterface.js`

const baseURL = "https://ft-nostress.chili-publish.com/";

export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ baseURL, "endUser", "chili#Password@1234", "ft-nostress" });

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
            "apiKey",
            baseURL,
            "Documents",
            path,
            1,
            true,
            true})

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```

While we are here, let's fix `generateAPIKey` and pull out the values we may also may want to change and should realistically be an environmental variable.

We will pull out the credentials for generating the end user API key.

```js
import {generateAPIKey, resourceGetTreeLevel} from `./chiliBackOfficeInterface.js`

const baseURL = "https://ft-nostress.chili-publish.com/";
const endUserCredentials = {
    name: "endUser",
    password: "chili#Password@1234",
    environment: "ft-nostress"
}

export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ 
            baseURL,
            endUserCredentials.name,
            endUserCredentials.password,
            endUserCredentials.environment
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
            "apiKey",
            baseURL,
            "Documents",
            path,
            1,
            true,
            true})

        return [{
            name:"",
            id:""
        }]
    }
    catch(e){

    }
}
```

Now, we need an API key for `resourceGetTreeLevel` that has permissions to make this call. That would be a key for our `envUser` we setup in Chapter 02.

Like the `endUser` lets set the credentials in the top of the `backend.js` file.
```js
import {generateAPIKey, resourceGetTreeLevel} from `./chiliBackOfficeInterface.js`

const baseURL = "https://ft-nostress.chili-publish.com/";
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

...
```

Now we can generate a key to be used.
```js
export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = await generateAPIKey({ 
            baseURL, 
            envUserCredentials.name, 
            envUserCredentials.password, 
            envUserCredentials.environment
        });

        const tree = await resourceGetTreeLevel({
            apiKey,
            baseURL,
            "Documents",
            path,
            1,
            true,
            true})

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

### Modifying resourceGetTreeLevel response
Right now our function is returning dummy data, but what we really want is any array of objects that contain a document id and name.

Right now `resourceGetTreeLevel` returns an XML string that has this pattern:
```xml
<tree path="StoreDocuments">
    <item id="some id" name="some name" isFolder="true or false" ...></item>
</tree>
```

I strongly suggest before moving on, going into Swagger, see [Chapter 02](../02_HTTP_API_And_Swagger/README.md), and playing around with ResourceGetTreeLevel to get a feel for the different responses.

The `<item>` element represents either a folder or a file, and you know which by the `isFolder` property. There are other properties on the `<item>` element, but the only ones we care about are `id` and `name`.

In addition, if you are looking in sub-folders (which we are not in the learning course), you need to notice that files in folders will be placed in the XML as a `<item>` with `isFolder="false"` in a `<item>` with `isFolder="true"`.

⚠️ __Why don't we just pass the XML along to the frontend?__
This is wear looking at the response of the ResourceGetTreeLevel endpoint is important. Each document `<item>` has an attribute `iconURL` which just so happens to have our API key we are using in the value. So if you passed this XML string unedited to the frontend, you just leaked your `envUser` API key and gave complete access to your Publisher environment.

Because we are not using any sub-folders the transformation from our XML string to objects with just a name and an id is rather simple. Also, because this is not a course in JavaScript, I am going to just give you the solution below, but feel free to try and come up with a solution on your own first.

```js
export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = await generateAPIKey({ 
            baseURL, 
            envUserCredentials.name, 
            envUserCredentials.password, 
            envUserCredentials.environment
        });

        const tree = await resourceGetTreeLevel({
            apiKey,
            baseURL,
            "Documents",
            path,
            1,
            true,
            true})

        // Parse the XML string
        const xmlDoc = (new DOMParser()).parseFromString(tree, "text/xml");
        
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

        return items;
    }
    catch(e){

    }
}
```

<br/>

### Updating the frontend to show our docs
Back in `frontend.js` we filled our function with some dummy data:
```js
export async renderStoreDocumentsFromBackOffice() {
    return [{
        documentID:"",
        previewURL:"https://fastly.picsum.photos/id/925/200/300.jpg"
    }]
}
```
We need to update that function to use our backend function `getDocumentsFromBackOffice` via the `/api/getdocumentsfrombackoffice` endpoint.

```js
export async renderStoreDocumentsFromBackOffice() {

    const response = await fetch(`/api/getdocumentsfrombackoffice`, {
        method:"GET"
    });

    const responseString = await response.text();

    // TODO

    return [{
        documentID:"",
        previewURL:"https://fastly.picsum.photos/id/925/200/300.jpg"
    }]
}
```

The response is going to be a JSON string, so we will need to parse it



### 🧪 Test our getDocumentsFromBackOffice function

TODO

<br/>

### ⚠️ Big API problem
⚠️ We have a problem. We don't want to generate a new key every time we call `getDocumentsFromBackOffice`. Remember how this function is called:

```
User loads the store page
    |
    |--> store page calls renderStoreDocumentsFromBackOffice() in frontend.js
                    |
                    |--> renderStoreDocumentsFromBackOffice() calls getDocumentsFromBackOffice() in backend.js
                                    |
                                    |--> getDocumentsFromBackOffice() returns an array of documents
```

This means every time the store page is loaded, the `getDocumentsFromBackOffice` would be called, and thus generating an API key every page reload.

That is not good. Generating a bunch of API keys will cause performance issues. 

### Fixing API key generation issue
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

...

export async function getDocumentsFromBackOffice(path) {

    try {

        const cache = fakeDatabaseGetDocument("cache");

        const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
        
        let apiKey = cache.envuserkey.value;

        if (Math.abs(cache.envuserkey.created - Date.now()) > fourHourInMilliseconds) {
            apiKey = await generateAPIKey({ 
                baseURL, 
                envUserCredentials.name, 
                envUserCredentials.password, 
                envUserCredentials.environment
            });
        }

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

We can also add this logic to our `getAPIKeyForUser` function because it is also bad for performance to generate a new key for every login.

```js
export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {

        const cache = fakeDatabaseGetDocument("cache");

        const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
        
        let apiKey = cache.enduserkey.value;

        if (Math.abs(cache.enduserkey.created - Date.now()) > fourHourInMilliseconds) {
            apiKey =  await generateAPIKey({ 
                baseURL,
                endUserCredentials.name,
                endUserCredentials.password,
                endUserCredentials.environment
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

### Simplifying our fix of API key generation issue
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
            baseURL, 
            envUserCredentials.name, 
            envUserCredentials.password, 
            envUserCredentials.environment
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
            baseURL, 
            credentials.name, 
            credentials.password, 
            credentials.environment
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

### Getting our previews

Great, everything is working!

However, there is no previews being show ☹️. That is because I lied to you, `server.js` expects `getDocumentsFromBackOffice` to return a signature like:
```ts
(path:string) => {name:string, id:string, previewURL:string}[]
```

Since we are not providing that `previewURL`, we get no previews.

----

This brings us to the end of Chapter 3! You now have a working store to show templates from the BackOffice, but with no previews.

In the next section, we will generate some previews for our store.