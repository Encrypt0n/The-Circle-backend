import { ref, uploadBytes } from "firebase/storage";
import * as dotenv from "dotenv";

const { storage, refHeader } = require('../utils/datasources/firebase.datasource');
const fs = require('fs');
const streamSessionService = require('./api/streamSession.service');
dotenv.config();

// Read the raw video+audio file and return it
async function readRawStreamFile(videoFilePath: string) {
    const videoData = fs.readFileSync(videoFilePath);
    return videoData;
}

// Upload the raw video+audio file to Firebase Storage and return the location of the file
// Usage example: const fileLocation = await uploadFileToStorageAndReturnFilePath('./SampleVideo_1280x720_1mb.mp4');
export const uploadFileToStorageAndReturnFilePath = async (videoFilePath: string, truYouAccountName): Promise<string> => {
    let fileLocation = '';
    // Get the video and the reference
    const videoData = await readRawStreamFile(videoFilePath);

    const parts = videoFilePath.split("/");
    const lastPart = parts[parts.length - 1];
    const precedingPart = parts[parts.length - 2];

    const result = `${precedingPart}/${lastPart}`;

    const videoRef = ref(storage, refHeader + result);

    // Upload to Firebase Storage
    await uploadBytes(videoRef, videoData)
        .then((result => {
            if(process.env.FIREBASE_FUNCTION.toString() == "true")
            {
                console.log('-----> Uploaded the mp4 to Firebase Storage!');
                // Define the file location with the result
                fileLocation = "gs://" + result.metadata.bucket + '/' + result.ref.fullPath;
                console.log('-----> File location = ' + fileLocation)
                fs.unlinkSync(videoFilePath);
                console.log('-----> Local file deleted!');
            }
        }))
        .catch(error => {
            return Promise.reject(error);
        });


    
    // Return the file location
    return Promise.resolve(fileLocation);
}