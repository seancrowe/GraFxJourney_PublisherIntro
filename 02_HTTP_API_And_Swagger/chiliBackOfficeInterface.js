


//GenerateAPIKey
export async function generateAPIKey({baseURL, userName, password, environment}) {
    // Endpoint for generate API key found in swagger: https://ft-nostress.chili-publish.online/swagger/ui/index#!/System/RestApi_GenerateApiKey
    const response = await fetch(`${baseURL}/rest-api/v1.2/system/apikey?environmentNameOrURL=${environment}`, {
        method:"POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            "userName": userName,
            "password": password
        })
    })

    // Handle the odd error cases
}

//ResourceGetTreeLevel

//AssetDownload - preview



//DocumentCreatePDF

//DocumentCreateTempPDF

//