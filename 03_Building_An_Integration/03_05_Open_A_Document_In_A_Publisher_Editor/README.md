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
async function copyDocumentForUser(username, documentID, documentName) {
  try{
    await resourceItemCopy({
      "resourceName",
      "itemID",
      "newName",
      "folderPath"
    });

    return {id:""};
  }
  catch(e){

  }
}
```

Let's talk about replacing each dummy data property:
- "resourceName" - This will be replaced with "Documents".
- "itemID" - This will be replaced with `documentID`.
- "newName" - This will be replaced with `documentName`.
- "folderPath" - Finally, we will get to use our `UserDocuments` folder in the BackOffice that we setup in [Section 02 - BackOffice setup](). We will replace this value with concatenation of "UserDocuments/" and `username`.

Now, let's replace those properties:
```js
async function copyDocumentForUser(username, documentID, documentName) {
  try{
    await resourceItemCopy({
      "Documents",
      documentID,
      documentName,
      "UserDocuments/" + username
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