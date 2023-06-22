 ```
 TODO:
    -Set up a CHILI doc to use for this section
    -Write up section for save + pdfgen buttons
    -Carryover finished section 3 project files to here (at least relevant ones)
 ```
 
 # Introduction to Publisher Interface
 ```
 put together a preamble leading in from the previous section
 "Our next step is to integrate a CHILI Publisher editor session into our app, to do that we first need to talk about Publisher Interface..."
 Most of this is ripped from PublisherInterface's github readme, can trim a lot of this out and just throw in a link to publisherInterface instead
 ```
 ## What is Publisher Interface?
 Publisher Interface is a JavaScript library that can be used to interact with a CHILI Publisher editor embedded in your own HTML page. Specifically, Publisher Interface works by using `postMessage` to communicate with any Publisher editor, regardless of domain name. This is important because of the `same-origin policy` that modern browsers enforce. This policy stops any JavaScript from a different domain running in your own site's domain. This creates an issue for integrating CHILI Publisher. In any integration, the editor must be run in an `iframe`, which is meant to open a website from another source in your own site. This means that any JavaScript that you might write with the intent of working on the `iframe`'s content would be coming from a different domain, and would thus be blocked by the `same-origin policy`. Publisher Interface exists as a way around this by acting as a "bridge" between your website's domain and the Publisher editor's domain, allowing you to send JavaScript from your website to the editor and interact with it.

 You can find a detailed description of PublisherInterface at its [Github site](https://github.com/chili-publish/publisher-interface). We highly recommend taking the time to look through the documentation available there, as it covers a wider array of talking points for PublisherInterface than we will be getting into here.

 The easiest way to get started with PublisherInterface to to install it via unpkg:

```javascript
import {PublisherInterface} from "https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js";
```

However, you can also choose to download the package via npm and import it with
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

This is just a very generic way to build a PublihserInterface instance. Let's take the principles behind this and build this out to work for our site now.

## Implementing Publisher Interface

⚠️ For this training, we'll be building PublisherInterface onto an `iframe` element that already exists in the document. However, the best practice when dealing with larger applications is to create the `iframe` element in the same JavaScript event loop that the PublisherInterface build method is called. Please refer to the [PublisherInterface documentation](https://github.com/chili-publish/publisher-interface) for information regarding this.

To set this up for our site, we can place the following code in our `frontend.js` file:
```javascript
import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';
import {fakeDatabaseGetDocument} from "./utilities.js"
var publisher;
async function main(PublisherInterface) {
    document.addEventListener("DOMContentLoaded", async () => {
        const cache = fakeDatabaseGetDocument("cache");
        let APIKEY = cache.envuserkey.value;
        
        const editorURL = `https://ft-nostress.chili-publish.online/ft-nostress/editor_html.aspx?doc=ac78a63b-f0f3-4b7f-b7e9-066e26ad9f2d&apiKey=${APIKEY}&fullWS=false`;

        const iframe = document.getElementsByTagName("iframe")[0];
        iframe.style.width = "720px";
        iframe.style.height = "720px";
        iframe.src = editorURL;

        const publisherPromise = PublisherInterface.build(iframe, { penpalDebug: true });
        publisher = await publisherPromise;

        window.publisherInterface = publisher;
    });
}
```

Some of this should look familiar to the initial example code. We're grabbing the PublisherInterface library from unpkg, and at the end of `main` we call the build method and wait for the promise to resolve. Let's quickly step through some of the extra code in place here though.

Continuing from what we built in the previous session, we are getting an API key from our faked database so we don't find ourselves generating a new API key every time the page is loaded. We also define an editor URL that we can then use as the `iframe`'s src attribute, and we also define the size of our `iframe` element.

If you've done everything correctly, then at this point you should see a CHILI Publisher editor session embedded in the page when you navigate to `/editor.html`. 

## Using Publisher Interface
Up to this point, nothing we've done actually needs any extra libraries to work; you could just as easily place an `iframe` in an HTML document with the src attribute set to the editor URL link, and you would see the exact same thing that we have so far. Let's look at what we can do with PublisherInterface implemented in order to justify our effort up to this point.


There are three main functions that you'll use when working with Publisher Interface. Those are `getObject`, `setProperty`, and `executeFunction`. If you already have some experience with CHILI Publisher, these might look familiar; these three functions directly correlate to the `editorObject` functions `GetObject`, `SetProperty`, and `ExecuteFunction`. These three function about as you'd expect from the names; `getObject` is used to retrieve editor properties and their values, `setProperty` is used to change editor properties, and `executeFunction` is used to call `editorObject` functions on the document or its child components.
```javascript
publisher.getObject('document.variables[Name].value'); //Returns the value of the 'Name' variable in a document
publisher.setProperty('document.variables[Name]', 'value', 'Brandon'); //Sets the value of the 'Name' variable in a document to 'Brandon'
publisher.executeFunction('document', 'GetTempXML'); //Executes the 'GetTempXML' function on a document
```

There's also a fourth pillar to PublisherInterface: event listeners. PublisherInterface comes with a myriad of events related to the CHILI document that you can attach listeners to in your code, which opens up a lot of possibilities. For example, in our `frontend.js` code, we could implement a loading screen to hide everything related to the Publisher editor session until the document has completely finished loading and rendering:
```javascript
import { PublisherInterface } from 'https://unpkg.com/@chili-publish/publisher-interface@latest/dist/PublisherInterface.min.js';
import {fakeDatabaseGetDocument} from "./utilities.js"
var publisher;
async function main(PublisherInterface) {
    document.addEventListener("DOMContentLoaded", async () => {
        const loadScreen = document.getElementById("loadingScreen");
        const editorScreen = document.getElementById("editorScreen");
        //grab API key from env variables
        const cache = fakeDatabaseGetDocument("cache");
        let APIKEY = cache.envuserkey.value;
        // Will have to replace with a better document
        const editorURL = `https://ft-nostress.chili-publish.online/ft-nostress/editor_html.aspx?doc=ac78a63b-f0f3-4b7f-b7e9-066e26ad9f2d&apiKey=${APIKEY}&fullWS=false`;
        // Build PublisherInterface, adjust window size here
        const iframe = document.getElementsByTagName("iframe")[0];
        iframe.style.width = "720px";
        iframe.style.height = "720px";
        iframe.src = editorURL;
        const publisherPromise = PublisherInterface.build(iframe, { penpalDebug: true });
        publisher = await publisherPromise;

        // Place document logic in this listener to ensure the CHILI document is fully loaded and rendered before trying any operations
        publisher.addListener("DocumentFullyRendered", async () => {
            loadScreen.setAttribute("style", "display:none");
            editorScreen.setAttribute("style", "display:flex");
        });
        window.publisherInterface = publisher;
    });
}
```
All we've done is added an event listener on the `DocumentFullyRendered` CHILI event that swaps the display values for our loading screen and editor screen. As a general rule, it's best to encompass any document interactions inside either this event listener or a listener on `DocumentFullyLoaded`. The order these events fire in is `DocumentFullyLoaded`, then `DocumentFullyRendered`.

Next, we can build our own rudimentary "variables panel" like you would see in the standard CHILI Publisher editor workspace. At the top of the our JavaScript code, we can add some variables to hold references to the HTML elements we want to use:
```javascript
// preexisting code
...
const loadScreen = document.getElementById("loadingScreen");
const editorScreen = document.getElementById("editorScreen");
// new code to add
const varInput = document.getElementById("varInput");
const varUpdateButton = document.getElementById("updateVariablesButton");
...
```
Following that, we can add a basic `click` event listener onto our button that executes PublisherInterface code in order to update a CHILI document variable:
```javascript
...
publisher.addListener("DocumentFullyRendered", async () => {
    //preexisting code
    loadScreen.setAttribute("style", "display:none");
    editorScreen.setAttribute("style", "display:flex");
    //new code
    varUpdateButton.addEventListener("click", async() => {
        await publisher.setProperty('document.variables[TestVar]', 'value', varInput.value);
    })
});
...
```

Now, if we load `/editor.html`, we'll see an editor session for our CHILI document, as well as a collection of controls, after the `DocumentFullyRendered` event fires and lets us know that the document is completely finished loading. If you click the `Update Variables` button, you should see the text on the embedded document reflect what you input.