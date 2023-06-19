# Intermediate Publisher Interface
## Event Listeners
Publisher Interface comes with a number of `events` that can be used to listen to numerous actions that might happen in the CHILI document. An entire training could be set aside just to cover all the of possible event listeners available, so for now we'll focus on `DocumentFullyLoaded` and `DocumentFullyRendered`. Both of these events are tied to the editor loading process. In terms of event order, `DocumentFullyLoaded` will always fire before `DocumentFullyRendered`. The differences between what causes each of these to fire lies in the naming; `DocumentFullyRendered` does not fire until the editor is fully loaded AND the content has been rendered on the page, whereas `DocumentFullyLoaded` will fire shortly before the content has been rendered.

Both `DocumentFullyLoaded` and `DocumentFullyRendered` can be used to ensure that JavaScript doesn't try to perform actions on editor components that don't yet exist.

## Using CHILI API in Your Integration
In a previous lesson, we explored a few examples of CHILI's REST API library. These can be used in conjunction with Publisher Interface functions to make a more feature-rich integration. For example, you can make a custom save button by calling the `ResourceItemSave` endpoint on a button click, and you can use Publisher Interface to get the working document ID and temp document XML to feed into the REST call. An example of this can be seen in the included `index.html` file.

Another example of this that you may have noticed from the previous lesson is authentication. At some point in your integration, you will need to grab a non-expired CHILI API key to actually load the documents and use other API endpoints.