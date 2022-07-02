const {BlobServiceClient} = require('@azure/storage-blob');
const multipart = require('parse-multipart');

function Upload(req) {
    if (!req.body) {
        return 'Sorry! No image attached.';
    }
    try{
        const boundary = multipart.getBoundary(req.headers['content-type']);
        const { body } = req;
        const parsedBody = multipart.Parse(body, boundary);
        const file = parsedBody[0];
    
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING,
        );
        const containerClient = blobServiceClient.getContainerClient('files');
    
        const blockBlobClient = containerClient.getBlockBlobClient(file.filename); // Get a block blob client
        blockBlobClient.upload(file.data, file.data.length);
        return `Successfully uploaded ${file.filename}`;
    }
    catch (ex){
        return "Failed to upload. Error: " + ex;
    }
}

async function Download(req) {
    const { filename } = req.headers;
    if (!filename){
        return "Filename not specified."
    }
    const {password} = req.headers;
    if (password != "hello123")
    {
        return "Incorrect or missing password."
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    const blobContainerClient = blobServiceClient.getContainerClient('files');
    let found = false;

    for await (const blob of blobContainerClient.listBlobsFlat()) {
        if (blob.name === filename) {
            found = true;
            break;
        }
    }
    if (found) {
        return `https://serverlesscamp.blob.core.windows.net/files/${filename}`;
    } else {
        return `The file, ${filename}, doesn't exist`;
    }
}

module.exports = async function (context, req) {
    let response;
    switch(req.method){
        case "POST":
            response = Upload(req);
            break;
        case "GET":
            response = await Download(req);
            break;
        default:
            response = "This endpoint only supports Get and Post requests."
    }

    context.res = {
    // status: 200, /* Defaults to 200 */
        body: response,
    };
}