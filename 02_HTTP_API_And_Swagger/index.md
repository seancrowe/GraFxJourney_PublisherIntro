


Explain about build your own interface

## Building generateAPIKey Function
To build a function to generate API key, we would need to look up the function details in swagger.

You  can find the swagger documentation on any environment URL:
```
https://{environment}.chili-publish.online/swagger/ui/index/
```

![Generate API Key](assets/GenerateAPIKey.png)

- Response success and Failures are not consistent across API calls
    - Passwords wrong you get a 201 with error in body
    - If the body request is wrong you 50?
    - 403 if environment missing in URL



## Building ResourceGetTreeLevel Function

- API key needs to be in the header for all other calls
- 

## DocumentCreatePDF

- Task system

## TaskGetStatus

- Resquest are inconsitent on True vs true
- You can have succeeded = "True" but the URL is empty
- string encoded XML - results attribute