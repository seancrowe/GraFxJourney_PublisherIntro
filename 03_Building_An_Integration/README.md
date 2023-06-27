# Chapter 03 - Building An Integration
In this section we going to using our `chiliBackOfficeInterface.js` and knowledge of API endpoints to build out an simple Publisher store.

This chapter is broken up into 7 sections:

- [01 Building A Login]() - We will build a login page, generate an API key, and store it in a session.
- [02 Building A Store From BackOffice]() - We will build a page to display our documents from the BackOffice to create a type of document store for the end user.
- [03 Fixing API Key Issue]() - After section 02, we have a big issue of generating API keys all the time. We will fix that issue.
- [04 Adding Previews]() - We will be adding previews to our store.
- [05 Open A Document In A Publisher Editor]() - We will build a page that will allow us to open a document in an Editor.

<br/>

## Chapter Setup
In your project do the following:
- Copy over the `server.js` file from the `03_Integration_Workflow/project` path on the git repo. We will not be reviewing this file as it contains code that hides away the complexity of handling request and responses. If you are really interested you can find more details in the (Server JS Setup)[] document.
- Create a folder called `public`. This folder will be where the script from `server.js` will server our HTML files.
- Create a file called `backend.js`. This file will contain all of our code which will be called by `server.js` to handle the logic of integrating with CHILI Publisher.
- Create a file called `database.json`. This file will act as our pretend database. We use a JSON file to keep things simple.

However, we are going to be copying a lot of HTML files from the `03_Integration_Workflow/project/public` path in the following sections. So, keep the git project files nearby.

<br/>

### Hiding Logic
Besides `server.js` much of the nodejs and browser logic is hidden in the prebuilt HTML files. This course is not a course on how to build websites, but how to use the CHILI APIs and discussing high level workflow.

<br/>

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

<br/>

----

In [Chapter 4](), we will start building out a custom UI and using the Publisher JavaScript API.