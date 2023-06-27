# Building A Login
For our simple application we will have a very basic login page. We are going to use a simple example to both generate API keys for GraFx Publisher and discuss how API keys are used on the frontend vs backend.

To start, copy over the `login.html` file from the `03_Integration_Workflow/project/public` git project folder to your project `public` folder.

This is a very simple HTML file that has a button which will call our backend. Specifically the only JavaScript in the HTML is a simple call to our server. What is going to happen is when you "login", the username and password will be passed to `server.js` which will then call the function `getAPIKeyForUser` from our `backend.js` script.

<br/>

## Creating the getAPIKeyForUser function
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
        const apiKey = await generateAPIKey({ 
            baseURL: "",
            userName: "",
            password: "",
            environment: ""
        });

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
import {generateAPIKey} from "./chiliBackOfficeInterface.js"

export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ 
            baseURL: "https://ft-nostress.chili-publish.online/",
            userName: "endUser",
            password: "chili#Password@1234",
            environment: "ft-nostress"
        });

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

<br/>

## Finishing our function - almost
Now we can finish our function but simply returning the apiKey in our function return.

Notice we have a `try/catch` block. If something goes wrong, we can throw the error and `server.js` which is call this function will handle the error properly responding with a 500.
```js
export async function getAPIKeyForUser(username) {

    // If something goes wrong, we will get an error, which we can just throw up the chain.
    try {
        const apiKey = await generateAPIKey({ 
            baseURL: "https://ft-nostress.chili-publish.online/",
            userName: "endUser",
            password: "chili#Password@1234",
            environment: "ft-nostress"
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
```
Also notice that as long as nothing goes wrong, we response with an API key. This is because we are not actually do anything authentication. In real life you would probably do a database lookup, but this is an example application, and we just accept any user with any password.

Finally, notice that we use the same GraFx Publisher user for all our project users. This is because it is better to think of the API key user not as user but as a token with permissions. Your application may have hundreds of users, but each one will map to only one API user.

<br/>

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
- If when login in you get Error on login endpoint:500, open your network tab and try again to read the Response from /authentication.
    - If you get an error that contains "ENOTFOUND" then you `baseURL` does not exist.
- If you do not get the error message "No store found." but instead get an site with a blue navigation at the top, then you probably copied over too many files from `03_Integration_Workflow/project/public` to your project's `public` folder. Please see the above root folder diagram. Your `public` folder should only have one file in it: `login.html`.
    

If you get stuck, create an issue on github and include a link to your repo for your project up to this point.

<br/>

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
----
In the next section, Chapter 03 - Section 02, we will set up a store page so there's actually a reason to login.