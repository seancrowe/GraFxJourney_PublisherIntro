- Skipping this for now and giving the rest of the sections priority

# Understanding The Integration Workflow
In this section we going to using our `chiliBackOfficeInterface.js` and knowledge of API endpoints to build out an simple CHILI integration.

This integration will include:
- A login screen, where we will attach a CHILI API key to the session.
- A page to display our documents that a user can select.
- A page to load a selected template for a user to edit, save, and generate output.
- A page to display all the documents a user has created, and to generate output.


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

If you get stuck, create an issue on github and include a zip package for your project up to this point.

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
    

If you get stuck, create an issue on github and include a zip package for your project up to this point.

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
| Externally  | All your document XMLs are stored in your own systems which gives you complete control. | The integration is more complex as you will need to have the systems in place to store the XML. | ✅ Yes |
| Hybrid      | While you do not have complete control, you do have control over the meta data, because your frontend is using your database to display and manage documents. Only the physical XML is being stored in CHILI. | The integration is more complex as it requires a database or similar to track document IDs, but less complex that being completely external. | ✅ Yes |

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
(apiKey:string) => {documentID:string, previewURL:string}[]
```

This function takes the `apiKey` string and returns an array of objects that contain the document id and preview URL of the document.

We can create the first version of our function in the `frontend.js` filled with some dummy data:
```js
export async renderStoreDocumentsFromBackOffice(apiKey) {
    return {
        documentID:"",
        previewURL:"https://fastly.picsum.photos/id/925/200/300.jpg"
    }
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
- If you only see a blank store with no document cards, then there are two most likely scenarios:
    - You did not properly place your `frontend.js` file in your `public` folder
    - You misnamed `frontend.js` file.
    - You misnamed `renderStoreDocumentsFromBackOffice`.
    - You forgot to export `renderStoreDocumentsFromBackOffice`.

If you get stuck, create an issue on github and include a zip package for your project up to this point.

 `resourceGetTreeLevel` method from the `chiliBackOfficeInterface.js` file