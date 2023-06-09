
# Swagger UI
You  can find the swagger documentation on any environment URL:
```
https://{environment}.chili-publish.online/swagger/ui/index/
```

The swagger UI is broken up into sections: Resource, System, Spelling, and Settings. These unfortunately do not relate to the sections similar named in the BackOffice application.

![Picture of the sections]

However, as a developer, you will most likely only care about Resource and System.

The swagger documentation documents all endpoints used by Publisher and the BackOffice. Meaning that very few of the endpoints on the swagger page are of any interest to you as a developer.

Each endpoint has a HTTP request method (verb), endpoint path, and a related method name.

![Picture showing the above]

Most commonly, CHILI developers refer to these endpoints by their related method name. So for the above picture, many would call that the `GenerateAPIKey` endpoint. Historially, Publisher used the SOAP messaging protocol which defined everything in terms of methods. Later, these SOAP methods were converted into HTTP endpoints.

You can use swagger to test out endpoints, but you will need to provide an API key for mosted endpoints to function properly. There are a few exceptions, such as GenerateAPIKey.

To get an API key, you generate on using GenerateAPIKey in the swagger UI. However, another option is to snag the API key if you are already logged into a BackOffice session.

As mentioned in the BackOffice Intro[Needs Link] you the BackOffice uses the same API calls as found in the swagger UI. So each call in the BackOffice has an API key attached to the header of the request.

![Picture of API key on header in network tab in BackOffice]

You can grab this API key and paste it into the input at the vert top of the swagger UI page. Then press `Expolore`.

![Picture of the input with button]

Once `Explore` is pushed, all requests made in the swagger UI will have this API key attached to request.


## Generating an API Key

Let's not steal an API key from the BackOffice but instead generate our own...

⚠️ All repsonses are XML, there is no JSON response

## Building a Generate API Key Function
To build a function to generate an API key, we would need to look up the function details in swagger.

![Generate API Key](assets/GenerateAPIKey.png)


For example, the URL has the query parameter `environemntOrURL`


If you make this API call without this parameter you will get back a 404 status code. However, not all API call will return a bad status code if a parameter is missing, but will instead succeed falling back to a default value. Typically the swagger documentation will mark optional parameters when they are optional.

![Need Picture showing option vs not optional parameter]

If you 

- Response success and Failures are not consistent across API calls
    - Passwords wrong you get a 201 with error in body
    - environment doesn't exist, 201 with error in body
    - If the body request is wrong you 400
    - 400 if environment missing in URL



## Building ResourceGetTreeLevel Function

- API key needs to be in the header for all other calls
- 

## DocumentCreatePDF

- Task system
- Building off above, 201 response doesn't necessarily mean you're getting a PDF (i.e. giving an incorrect or invalid itemID will still succesfully create the task)

## TaskGetStatus

- Resquest are inconsitent on True vs true
- You can have succeeded = "True" but the URL is empty
- string encoded XML - results attribute