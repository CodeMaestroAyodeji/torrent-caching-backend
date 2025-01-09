// utils/backblaze.js

const fs = require('fs');
const B2 = require('backblaze-b2');

// Initialize Backblaze B2 client with credentials from environment variables
const b2 = new B2({
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID, // Application Key ID
    applicationKey: process.env.B2_APPLICATION_KEY,     // Application Key
});

const uploadFileToB2 = async (fileBuffer, fileName) => {
    try {
        // Authorize the B2 client
        await b2.authorize();

        // Get the upload URL and authorization token
        const { data: uploadUrlData } = await b2.getUploadUrl({
            bucketId: process.env.B2_BUCKET_ID,
        });

        // Upload the file to B2
        const response = await b2.uploadFile({
            uploadUrl: uploadUrlData.uploadUrl,
            uploadAuthToken: uploadUrlData.authorizationToken,
            fileName: fileName,
            data: fileBuffer, // Buffer data directly passed here
        });

        // Return only necessary fields
        return {
            fileName: response.data.fileName,
            fileId: response.data.fileId,
        };
    } catch (error) {
        // Log the error details
        console.error('Error uploading file to B2:', error);

        // Check if the error is related to authorization
        if (error.response && error.response.status === 401) {
            console.error('Authorization error: Please check your credentials and try again.');
        }

        throw error;
    }
};

module.exports = { uploadFileToB2 };