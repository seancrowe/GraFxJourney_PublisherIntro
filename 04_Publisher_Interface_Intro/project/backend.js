import {fakeDatabaseGetDocument, fakeDatabaseSetDocument} from "./utilities.js";
import {DOMParser} from "@xmldom/xmldom";
import {downloadAssets, generateAPIKey, resourceGetTreeLevel, resourceItemCopy, documentCreateTempPDF, taskGetStatus} from "./chiliBackOfficeInterface.js";

const baseURL = "https://ft-nostress.chili-publish.online/";
// New object to hold our credentials
const endUserCredentials = {
    name: "endUser",
    password: "",
    environment: "ft-nostress"
}
const envUserCredentials = {
    name: "envUser",
    password: "",
    environment: "ft-nostress"
}
//pdfExportSettings XML string
const pdfExportSettings = '<item name="Default" id="89861ba8-dcdc-4260-963d-64a7b7f55469" relativePath="" pdfEngine="1" missingAdPlaceHolderColor="#FF00FF" missingAdPlaceHolder="False" missingEditPlaceHolder="False" includeLinks="False" includeGuides="False" includeTextRangeBorder="True" includePageMargins="True" includeFrameBorder="True" imageQuality="original" includeCropMarks="True" includeBleedMarks="True" includeImages="True" convertColors="False" colorProfile="" embedProfile="False" includeNonPrintingLayers="False" includeGrid="True" includeBleed="False" includeAdOverlays="False" includeSectionBreaks="False" includePageLabels="False" includeFrameInset="True" includeBaseLineGrid="True" includeSlug="False" includeAnnotations="False" outputSplitPages="1" layoutID="" createAllPages="True" pageRangeStart="1" userPassword="" ownerPassword="" pdfSubject="" pdfKeywords="" watermarkText="Watermark" pdfLayers="False" createSingleFile="True" createSpreads="False" serverOutputLocation="" pdfNamePattern="" slugLeft="" slugTop="" slugRight="" slugBottom="" bleedRight="3 mm" bleedTop="3 mm" bleedLeft="3 mm" useDocumentBleed="True" useDocumentSlug="True" optimizationOptions="" preflight_overrideDocumentSettings="False" preflight_minOutputResolution="72" preflight_minResizePercentage="70" preflight_maxResizePercentage="120" dataSourceIncludeBackgroundLayers="True" dataSourceCreateBackgroundPDF="True" dataSourceRowsPerPDF="50000000" dataSourceMaxRows="-1" dontDeleteExistingDirectory="False" collateOutputWidth="210mm" collateNumRows="3" collateNumCols="3" collateOutputHeight="297mm" collateColumnWidth="50mm" collateStartX="10mm" collateStartY="10mm" collateMarginX="10mm" allowExtractContent="True" collateMarginY="10mm" collateOutput="False" collateDrawPageBorder="False" collateIncludeFileHeader="False" missingAdSizePlaceHolderColor="#FF00FF" rgbSwatches="False" dropshadowQuality="150" missingEditPlaceHolderColor="#FF00FF" annotationBorderColor="#FF0000" annotationFillColor="#FFFFFF" annotationOpacity="50" linkBorderColor="#0000FF" dropshadowTextQuality="150" bleedBottom="3 mm" barWidthReduction="0 mm" markOffset="9pt" markWidth="0.5pt" dataSourceEngine="server_code" dataSourceNumConcurrent="8" dataSourceUnspecifiedContentType="variable_data" dataSourceIncludeGenerationLog="True" dataSourceUnspecifiedPageContentType="variable_data" outputIntentRegistryName="" outputIntentConditionIdentifier="" outputIntent="" pdfStandard="" pdfVersion="4" debugVtContent="False" watermarkType="none" watermarkPdfAssetID="" watermarkPdfAnchor="top_left" pageRangeEnd="999999" watermarkPdfSize="original" convertBlacks="False" convertAnyK100="True" convertSystemBlack="True" convert0_0_0_100="True" convertBlackToC="63" convertBlackToK="100" convertBlackToY="51" convertBlackToM="52" debugDropShadowsWithoutBlur="False" missingAdSizePlaceHolder="False" pdfCreator="CHILI Publisher" pdfAuthor="CHILI Publisher" allowPrinting="True" allowModifyDocument="True" fastWebView="False" embedFonts="True" useFontSubset="True" exportDatasourceXlsx="False" exportDatasourceCsv="True" pdfTitle="" dataSourceCreate="False" includeBookmarks="False" maxRecordsPerDatasourceFile="50000" minSuccessRate="100" errorHandling="error" removeInvisibleImageData="False" forPreview="False"><pdfvt_metaDataConfigItems/><color_images_settings downsampling="Off" targetResolution="0" resolutionThreshold="0" compression="RetainExisting" compressionQuality=""/><grayscale_images_settings downsampling="Off" targetResolution="0" resolutionThreshold="0" compression="RetainExisting" compressionQuality=""/><monochrome_images_settings downsampling="Off" targetResolution="0" resolutionThreshold="0" compression="RetainExisting" compressionQuality=""/></item>'

export async function getAPIKeyForUser(username) {

    try {

        const apiKey = await getAPIKey(endUserCredentials, "enduserkey");

        return {
            username: username,
            apiKey: apiKey,
            environment: endUserCredentials.environment,
            baseURL: baseURL
        }
    }
    catch(e) {
        throw e;
    }
}

export async function getDocumentsFromBackOffice(path) {

    try {

        const apiKey = await getAPIKey(envUserCredentials, "envuserkey");

        const resp = await resourceGetTreeLevel({
            apiKey: apiKey,
            baseURL: baseURL,
            resourceName: "Documents",
            parentFolder: path,
            numLevels: 1,
            includeSubDirectories: true,
            includeFiles: true
        });

        const xmlDoc = (new DOMParser()).parseFromString(resp, "text/xml");

        const itemElements = xmlDoc.getElementsByTagName("item");

        const items = Array.from(itemElements).map((item) => {
            const id = item.getAttribute("id");
            const name = item.getAttribute("name");
            const previewURL = "/api/getdocumentpreview/" + id;
            const isFolder = item.getAttribute("isFolder") === "true";

            if (isFolder || id == "") {
                return null;
            }

            return { id, name, previewURL };
        }).filter(Boolean);

        return items;
    }
    catch(e){
        console.log(e);
        throw e;
    }
}

export async function getDocumentPreview(documentID) {
    try {
  
      const apiKey = await getAPIKey(envUserCredentials, "envuserkey");
  
      return await downloadAssets({
         apiKey, 
         baseURL:baseURL, 
         resourceType: "Documents", 
         id: documentID, 
         type: "medium"
      })
    }
    catch(e) {
        throw e;
    }
  }

export async function copyDocumentForUser(username, documentID, documentName) {
    try{
        
        const apiKey = await getAPIKey(envUserCredentials, "envuserkey");

        // Get the current date
        const currentDate = new Date();

        // Extract the year, month, and day
        const year = currentDate.getFullYear();
        const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
        const day = ("0" + currentDate.getDate()).slice(-2);

        // Create the "year/month/day" string
        const dateString = year + "/" + month + "/" + day;
        
        const itemXML = await resourceItemCopy({
            apiKey: apiKey,
            baseURL:baseURL,
            resourceName: "Documents",
            itemID: documentID,
            newName: documentName,
            folderPath: "%CREATE_US_23/UserDocuments/" + username + "/temp/" + dateString
        });

        const itemDoc = (new DOMParser()).parseFromString(itemXML, "text/xml");

        const id = itemDoc.documentElement.getAttribute("id");

        return {id:id};
    }
    catch(e){
        throw e;
    }
}

export async function outputDocument(docXML) {
    try {
        const apikey = await getAPIKey(envUserCredentials, "envuserkey");

        const task = await documentCreateTempPDF({
            apikey: apikey,
            baseURL:baseURL,
            settingsXML: pdfExportSettings,
            docXML: docXML
        });

        const taskXML = (new DOMParser()).parseFromString(task, "text/xml");
        const taskID = taskXML.documentElement.getAttribute("id");

        let running = true;
        let taskResult = "";

        while(running){
            taskResult = await getTaskStatus(taskID);
            if(taskResult == "working"){
                //do nothing, repeat loop
            }
            else if (taskResult == "failed"){
                throw "task failed";
            }
            else{
                running = false;
                return taskResult;
            }
        }
    }
    catch(e){
        throw e;
    }
}

async function getTaskStatus(taskID){
    const apikey = await getAPIKey(envUserCredentials, "envuserkey");

    const response = await taskGetStatus({
        apiKey: apikey,
        baseURL: baseURL,
        taskID:taskID
    });
    const taskXML = (new DOMParser()).parseFromString(task, "text/xml");
    const finished = taskXML.documentElement.getAttribute("finished");
    if(finished == 'true'){
        const succeeded = taskXML.documentElement.getAttribute("succeeded");
        if(succeeded == 'true'){
            const result = taskXML.documentElement.getAttribute("result");
            return result;
        }
        else{
            return "failed";
        }
    }
    else{
        return "working";
    }
}

async function getAPIKey(credentials, documentEntry) {
    const cache = fakeDatabaseGetDocument("cache");

    const fourHoursInMilliseconds = 4 * 60 * 60 * 1000;
    
    let apiKey = cache[documentEntry].value;

    if (Math.abs(cache[documentEntry].created - Date.now()) > fourHoursInMilliseconds) {
        apiKey = await generateAPIKey({ 
            baseURL: baseURL, 
            userName: credentials.name, 
            password: credentials.password, 
            environment: credentials.environment
        });

        cache[documentEntry].value = apiKey;
        cache[documentEntry].created = Date.now();
        fakeDatabaseSetDocument("cache", cache);
    }

    return apiKey;
}