 # Introduction to Publisher Interface
 ## What is Publisher Interface?
 Publisher Interface is a JavaScript library that can be used to interact with a CHILI Publisher editor embedded in your own HTML page. Specifically, Publisher Interface works by using `postMessage` to communicate with any Publisher editor, regardless of domain name. This is important because of the `same-origin policy` that modern browsers enforce. This policy stops any JavaScript from a different domain running in your own site's domain. This creates an issue for integrating CHILI Publisher. In any integration, the editor must be run in an `iframe`, which is meant to open a website from another source in your own site. This means that any JavaScript that you might write with the intent of working on the `iframe`'s content would be coming from a different domain, and would thus be blocked by the `same-origin policy`. Publisher Interface exists as a way around this by acting as a "bridge" between your website's domain and the Publisher editor's domain, allowing you to send JavaScript from your website to the editor and interact with it.

 ## Implementing Publisher Interface
 The easiest way to get started is to pull the package from unpkg.

```javascript
import {PublisherInterface} from "https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js";
```

If you downloaded via NPM you can import it with
```javascript
import {PublisherInterface} from "@chili-publish/publisher-interface";
```

<br/>

Then in your JavaScript code, get the iframe which is loading the Publisher editor, and pass that iframe element into the `build()` function of `PublisherInterface`.

```javascript
const iframe = document.getElementById("editor-iframe");
const publisher = PublisherInterface.build(iframe).then(
    PublisherInterface => PublisherInterface.alert("Hi!")
);
```

🚨 **Important** - make sure that you call `build()` before the iframe `onload` event is fired. In practice this means that you should never call `build()` when that event is fired.

<br/>

In simple use cases, the below example will work well.
```html
<body>
    <iframe id="editor-iframe" style="width:1200px; height:800px"
        src="https://example.chili-publish.online/example/editor_html.aspx?doc=3d178228-a9b9-49d0-90d9-c1c8f8b67f05&apiKey=Sczs1ruhiZcaFiqg0G07gMFMq07X+SG2o8KlW8oAeZGqoB1a0YkbeZU1wJK15aIhANgZmhg+13NQlxpBEq7Q=="></iframe>
    <script type="module">
        import {PublisherInterface} from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';
    
        const iframe = document.getElementById("editor-iframe");
    
        (async () => {
            const publisher = await PublisherInterface.build(iframe);
            const documentName = await publisher.getObject("document.name");
            console.log(documentName);
        })();
    </script>
</body>
```

<br/>
When dealing with larger applications, it's important to ensure that the `iframe` and the `PublisherInterface` build method are called in the same JavaScript event loop. To do this, follow these steps:

1. Create the `iframe` element and set its `src` attribute.
2. Pass the `iframe` element to the `build` method of `PublisherInterface` and capture the promise returned from the method.
3. Append the `iframe` element to the DOM.
4. Await the promise captured in step 2 and assign it to a variable that can be used throughout your application.

Example Code:

```html
<body>
  <script type="module">
    import {PublisherInterface} from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';

    document.addEventListener("DOMContentLoaded", async () => {
      (async () => {
        const iframe = document.createElement("iframe");
        iframe.src = "https://example.chili-publish.online/example/editor_html.aspx?doc=3d178228-a9b9-49d0-90d9-c1c8f8b67f05&apiKey=Sczs1ruhiZcaFiqg0G07gMFMq07X+SG2o8KlW8oAeZGqoB1a0YkbeZU1wJK15aIhANgZmhg+13NQlxpBEq7Q==";
        const publisherPromise = PublisherInterface.build(iframe);
        document.body.appendChild(iframe);
        const publisher = await publisherPromise;
        const documentName = await publisher.getObject("document.name");
        console.log(documentName);
      })();
    });
  </script>
</body>
```

Included in the folder for this section is a `index.html` file that has a very simple example of loading a CHILI Publisher editor window and building Publisher Interface onto the `iframe`.

## Publisher Interface Functionality
There are three main functions that you'll use when working with Publisher Interface. Those are `getObject`, `setProperty`, and `executeFunction`. If you already have some experience with CHILI Publisher, these might look familiar; these three functions directly correlate to the `editorObject` functions `GetObject`, `SetProperty`, and `ExecuteFunction`. These three function about as you'd expect from the names; `getObject` is used to retrieve editor properties and their values, `setProperty` is used to change editor properties, and `executeFunction` is used to call `editorObject` functions on the document or its child components.
```javascript
publisher.getObject('document.variables[Name].value'); //Returns the value of the 'Name' variable in the document
publisher.setProperty('document.variables[Name]', 'value', 'Brandon'); //Sets the value of the 'Name' variable in the document to 'Brandon'
publisher.executeFunction('document', 'GetTempXML'); //Executes the 'GetTempXML' function on the document
```

## Setting up the project
 - This might need to be its own section before this; Austin's Studio training has a nice preamble section about setting the project to actually work as a web server, I think we should just copy that over here (and also use parcel like he's doing, it looks a lot cleaner than having server code that we just kind of ignore for the actual training)