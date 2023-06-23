# Open A Document In A Publisher Editor
We have a beautiful store that shows documents from the BackOffice to the end user, but you cannot do anything with them.

Each store card has a button named "Edit", which when clicked does nothing. What we want to happen is when clicked for the editor to open.

However, we do not want the editor to open the document from the store. That would be bad, because it means our end users could modify store documents. What we really want to do is create a copy of the document and let end users edit their copy.

## What happens when "Edit" is pressed
If you look in `store.html` you find that a function `openEditor` is called when the "Edit" button is pressed. This function calls the endpoint `/api/copydocument` which `server.js` will then send that info to the function `copyDocumentForUser` from `backend.js`.

The `openEditor` waits until endpoint response back with the ID of the copied document to open.

Here is a visual representation of the flow:
```
    store.html        server.js          backend.js
        |                 |                   |
        |                 |                   |
   +----|---------------->|                   |
   |    |                 |                   |
   |    |    openEditor() |                   |
   |    |---------------->|                   |
   |    |                 |                   |
   |    |                 |                   |
   |    |                 | copyDocumentForUser()
   |    |                 |------------------>|
   |    |                 |                   |
   |    |                 |                   |
   |    |                 |                   |
   |    |                 |<------------------|
   |    |                 |   Response with   |
   |    |                 |   copied document |
   |    |                 |        ID         |
   |    |                 |                   |
   |    |<----------------|                   |
   |    |                 |                   |
   |    |   Response with |                   |
   |    |   copied        |                   |
   |    |   document ID   |                   |
   |    |                 |                   |
   |    |                 |                   |
   |    |                 |                   |
   |    |---------------->|                   |
   |    |   Open copied   |                   |
   |    |   document      |                   |
   |    |---------------->|                   |
   |    |                 |                   |
   +----|-----------------|-------------------|
        |                 |                   |

```


Open up `backend.js` as we will need to add a new function `copyDocumentForUser`. The signature for this function is:
```ts
(username:string, documentID:string, documentName:string) => Promise<{id:string}>
```

Lets write our first version of the function using `resourceItemCopy` from `chiliBackOfficeInterface.js`.

First lest import `resourceItemCopy` in the `backend.js` file.
```js
import {downloadAssets, generateAPIKey, resourceGetTreeLevel, resourceItemCopy} from `./chiliBackOfficeInterface.js`
```

Then write the function with dummy data:
```js
async function copyDocumentForUser(username, itemID: documentID, documentName) {
  try{
    await resourceItemCopy({
      resourceName: "",
      itemID: "",
      newName: "",
      folderPath: ""
    });

    return {id:""};
  }
  catch(e){

  }
}
```

Let's talk about replacing each dummy data property:
- resourceName - This will be replaced with "Documents".
- itemID - This will be replaced with `documentID`.
- newName - This will be replaced with `documentName`.
- folderPath - Finally, we will get to use our `UserDocuments` folder in the BackOffice that we setup in [Section 02 - BackOffice setup](). We will replace this value with concatenation of "UserDocuments/" and `username` and "temp". We are using this path, because the user hasn't yet placed an order but we need to put the document somewhere temporary.

Now, let's replace those properties:
```js
async function copyDocumentForUser(username, itemID: documentID, documentName) {
  try{
    await resourceItemCopy({
      resourceName: "Documents",
      itemID: documentID,
      newName: documentName,
      folderPath: "UserDocuments/" + username + "/temp"
    });

    return {id:""};
  }
  catch(e){

  }
}
```

#### ⚠️🐛 Bug Alert
If you remember our login page in [Section 01]() does not limit characters in the username used, but Publisher is storing the paths physically on a filesystem which does have a limit on character type and length. That means if a username has illegal characters, this call will fail.

We are not going to fix this bug, but feel free to fix it in your version of the learning project.

## Getting ID from response
Right now we are returning a blank ID, but we need to pull the ID of the document out of the `resourceItemCopy` response.

The response will look something like:
```xml
<item name="name of document" id="5f6cbb27-49a6-489e-9d4c-8ff0907152e5" ... ></item>
```

Again, this is not a course in JavaScript, so I am going to add the code to get the ID to the function. Feel free to try and write your own before moving forward.

```js
async function copyDocumentForUser(username, itemID: documentID, documentName) {
  try{
    const resp = await resourceItemCopy({
      resourceName: "Documents",
      itemID: documentID,
      newName: documentName,
      folderPath: "UserDocuments/" + username + "/temp"
    });

    // Get resp body as a string
    const itemXML = await resp.text();

    // Create a DOMParser object and parse the XML string
    const itemDoc = (new DOMParser()).parser.parseFromString(itemXML, "text/xml");

    // Get the id attribute value
    const id = itemDoc.documentElement.getAttribute("id");

    // Return the id
    return {id:id};
  }
  catch(e){

  }
}
```

### 🧪 Test opening of editor

TODO
Go back and test

## ⚠️ Problem of clutter
Everything works now, but we have a problem that will hit us long term. Right now we are putting this temp document in the path `/UserDocuments/{username}/temp` which works, but over time this folder will be come massive. Imagine 1000 users all using our application every day.

Many times people do not think about clean up 🧹 of their data because they are so focused on launching. Then a few years go by, and they are using to much storage or hitting the 1000 documents per folder limit (the BackOffice and some API calls only return the first 1000 items in a folder). They then come to Support asking how to fix their problem, but there is no easy solution once you are thousands of files deep in clutter.

Now that we know the problem, what are some solutions?

### First Solution
First solution is we could update our copy function to copy the documents into a temp folder that is split by date.

So instead of `/UserDocuments/{username}/temp`
it would be `/UserDocuments/{username}/temp/{year}/{month}/{day}`

That would be pretty easy to write in code. Here would be our update function if we wanted to go with that solution.

```js
async function copyDocumentForUser(username, itemID: documentID, documentName) {
  try{
    
    // Get the current date
    const currentDate = new Date();

    // Extract the year, month, and day
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDate.getDate()).slice(-2);

    // Create the "year/month/day" string
    const dateString = year + "/" + month + "/" + day;
    
    const resp = await resourceItemCopy({
      resourceName: "Documents",
      itemID: documentID,
      newName: documentName,
      folderPath: "UserDocuments/" + username + "/temp/" + dateString // Add dataString
    });

    const itemXML = await resp.text();

    const itemDoc = (new DOMParser()).parser.parseFromString(itemXML, "text/xml");

    const id = itemDoc.documentElement.getAttribute("id");

    return {id:id};
  }
  catch(e){

  }
}
```

This solution would allow us to then create a clean script to go through every user temp folder and delete folders by year, month, or even day.

### Second Solution
The first solution is very practical, but it does make our cleanup script a bit more complicated. If we do not have a requirement that users documents pre-order must be tied to their user then we could just store everything in one big temp folder.

That way our clean up script can clean that folder every day, week, month, etc.

We still need to break the temp folder down into /{year}/{month}/{day} and if we have a lot of users we might even need to break it down into hours /{year}/{month}/{day}/{hour}. The reason we add hour is because we getting a higher volume of documents because temp is now for all of our users.

```js
async function copyDocumentForUser(username, itemID: documentID, documentName) {
  try{
    
    // Get the current date
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDate.getDate()).slice(-2);
    // Extract the hour as well
    const hour = ("0" + currentDate.getHours()).slice(-2);

    const dateString = year + "/" + month + "/" + day "/" + hour; // Add hour
    
    const resp = await resourceItemCopy({
      resourceName: "Documents",
      itemID: documentID,
      newName: documentName,
      folderPath: "UserDocuments/" + username + "/temp/" + dateString
    });

    const itemXML = await resp.text();

    const itemDoc = (new DOMParser()).parser.parseFromString(itemXML, "text/xml");

    const id = itemDoc.documentElement.getAttribute("id");

    return {id:id};
  }
  catch(e){

  }
}
```

### Third Solution
Finally a really good solution, if you do not require the saving of any documents before a user orders, is to not use the ResourceItemCopy endpoint but instead use ResourceItemGetXML. The ResourceItemGetXML which will give you the document XML. You can then load that XML in Publisher editor directly with the Publisher JavaScript API.

## Which solution
For this learning project we are going to continue with the first solution.

If you are following along, please update your `copyDocumentForUser` with the first solution.
```js
async function copyDocumentForUser(username, itemID: documentID, documentName) {
  try{
    
    // Get the current date
    const currentDate = new Date();

    // Extract the year, month, and day
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDate.getDate()).slice(-2);

    // Create the "year/month/day" string
    const dateString = year + "/" + month + "/" + day;
    
    const resp = await resourceItemCopy({
      resourceName: "Documents",
      itemID: documentID,
      newName: documentName,
      folderPath: "UserDocuments/" + username + "/temp/" + dateString // Add dataString
    });

    const itemXML = await resp.text();

    const itemDoc = (new DOMParser()).parser.parseFromString(itemXML, "text/xml");

    const id = itemDoc.documentElement.getAttribute("id");

    return {id:id};
  }
  catch(e){

  }
}
```

### 🧪 Test opening of editor

TODO
Go back and test

----

This is the end of the section...

