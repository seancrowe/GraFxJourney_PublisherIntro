# Certification Test

The best way to explore interacting with an editor session via PublisherInterface is to get your hadns dirty with it, so to earn your certifications we'll be assigning some tasks to complete using the library.

## Things to know
We went through some examples of PublisherInterface in the last chapter, but here's some general knowledge that'll help you in your tests:

```javascript
//IMPORTING PUBLISHERINTERFACE FROM UNPKG
import {PublisherInterface} from "https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js";
```

```javascript
//BUILDING ONTO AN EXISTING IFRAME
const iframe = document.getElementById("editor-iframe");
const publisherPromise = PublisherInterface.build(iframe);
const publisher = await publisherPromise;
```

```javascript
//EVENT LISTENERS
publisher.addListener('DocumentFullyRendered', async() => {
    //some code...
})
```

```javascript
//USING GETOBJECT
let docVarValue = await publisher.getObject('document.variables[Title].value')
```

```javascript
//USING SETPROPERTY
await publisher.setProperty('document.variables[Title]', 'value', 'Brandon')
```

```javascript
//USING EXECUTEFUNCTION
await publisher.executeFunction('document', 'GetTempXML')
```

## Basic certification
You will need to import a provided CHILI document (we will provide an editorURL) and set up functionality to change the document zoom level, update a document variable, and output a PDF of the document using documentCreateTempPDF.

## Advanced certification
You will need to add functionality to your document to bring up an image upload prompt when (and only when) an image frame is selected in the CHILI document. This image upload prompt should allow a user to upload a local image and see that image appear on the document.