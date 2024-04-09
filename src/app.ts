import { PKCMiddleware, verifySignature } from "./middleware/pkc.middleware";
import { Server, Socket } from "socket.io";
import { createServer } from "http";
import "reflect-metadata";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { masterRouter } from "./routes";
import type { MessagePayload } from "./models/entities/Message";
import { cacheMiddleware } from "./middleware/cache.middleware";

const NodeCache = require("node-cache")
import NodeMediaServer from 'node-media-server'; // Import node-media-server
import { uploadFileToStorageAndReturnFilePath } from "./services/firebase.service";
import { Readable } from "stream";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import WebSocket from "ws";
import { serverSigMiddleware, signContentServer } from "./middleware/server-sig.middleware";

let messageService = require('./services/api/message.service');
import {createVerify, privateDecrypt} from "node:crypto";
import {DigitalSignature} from "./models/DigitalSignature";
import { json } from "stream/consumers";
import { spawn } from "child_process";

dotenv.config();
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.static("public"));


// =====================================================================================================================
// MIDDLEWARE
// =====================================================================================================================

// Middleware all post/put requests
const cache = new NodeCache({ stdTTL: 60, deleteOnExpire: true })
app.use(
    (req, res, next) => cacheMiddleware(req, res, next, cache)
)
app.use(serverSigMiddleware)
app.post("/*", PKCMiddleware)
app.put("/*", PKCMiddleware)

// =====================================================================================================================
// Register Routes
// =====================================================================================================================
app.use('/api', masterRouter);
const server = createServer(app);
server.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
let io = new Server(server, { cors: { origin: "*" } });

// =====================================================================================================================
// Chat websocket
// =====================================================================================================================
io.on('connection', (socket: Socket) => {
    socket.on('message', async (data: DigitalSignature<MessagePayload>) => {
        let valid = await verifySignature(data, cache)
        socket.emit('valid-message', valid)
        if (valid) {
            let msg = data.payload
            msg.serverSignature = await signContentServer(msg)
            io.emit('message-broadcast', msg);
            await messageService.postMessage(msg);
        }
    });
});





// =====================================================================================================================
// Server key
// =====================================================================================================================


// =====================================================================================================================
// Node Media Server
// =====================================================================================================================
// TODO: seperation of concers move deze troep weg uit app.ts
// Initialize NodeMediaServer
const config = {
    rtmp: {
        port: 1935,
        chunk_size: 4096,
        gop_cache: false,
        ping: 1,
        ping_timeout: 60,
    },
    http: {
        port: 3001,
        mediaroot: "./media",
        allow_origin: "*",
        webroot: "./www", // Add this line if necessary
        cors: {
            origin: "*",
            methods: ["GET", "PUT", "POST", "DELETE"],
            allowedHeaders: ["Content-Type"],
        },
    },
    trans: {
        ffmpeg: "/usr/bin/ffmpeg", // Replace with the actual path to your FFmpeg binary
        tasks: [
            {
                app: "live",
                mp4: true,
                mp4Flags: "[movflags=frag_keyframe+empty_moov]",
                format: "id", // Set the format to 'id'
            },
        ],
    },
};

ffmpeg.setFfmpegPath(ffmpegPath.path);
const nms = new NodeMediaServer(config);

const truYouAccountService = require('./services/api/truYouAccount.service');

nms.on('prePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    const transparantPersonName: string = StreamPath.split("/")[2];
    truYouAccountService.updateIsLive(transparantPersonName, true)
});

nms.on("donePublish", async (id, StreamPath, args) => {
    // Your code to send the saved file to another server goes here
    console.log("Stream closed:", StreamPath);
    const transparantPersonName: string = StreamPath.split("/")[2];

    //ADD SAVE TO API
    const mostRecentFile = getMostRecentFile("./media/" + StreamPath);
    const firebaseStoragelocation = await uploadFileToStorageAndReturnFilePath(
        "./media/" + StreamPath + "/" + mostRecentFile,
        transparantPersonName
    );

    await truYouAccountService.updateIsLive(transparantPersonName, false, firebaseStoragelocation);
});

nms.on('prePlay', (id, StreamPath, args) => {
    const streamName: string = StreamPath.split("/")[2];
    truYouAccountService.updateViewerCount(streamName, 1);
});

nms.run();



// Create WebSocket server
const wss2 = new WebSocket.Server({port: 3002});



// Handle WebSocket connection
wss2.on('connection',(ws, req) => {
    console.log('Client connected to WebSocket server');
    const text =req.url;
    //const text = '/?streamname=John_Doe';
const parts = text.split('='); // Split the text on the "=" character
const name = parts[1]; 
console.log(name);
  
    // Create FFmpeg command to capture frames from the Node Media Server stream
    const streamUrl = 'rtmp://localhost/live/'; // Replace with the actual stream URL
  
    const command = ffmpeg(streamUrl+name)
    .inputOptions('-re')
    .outputOptions('-c:v libvpx') // Use VP8 video codec
    .outputOptions('-c:a libopus') // Use Opus audio codec
    .outputOptions('-f webm') // Output format as WebM
    .outputOptions('-quality good') // Set video quality
    .outputOptions('-speed 4') // Set encoding speed
    .outputOptions('-pix_fmt yuv420p') // Set pixel format for compatibility
    .outputOptions('-vf fps=30') // Set video frame rate
    .on('start', () => {
      console.log('FFmpeg process started');
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err.message);
    })
    .on('end', () => {
      console.log('FFmpeg process ended');
    });
  
  command.pipe().on('data', async (frameData) => {
    // Send the video frame data to the WebSocket client
    console.log('Frame data:', frameData);
    /*let base64String;
    let reader = new FileReader();
    reader.readAsDataURL(frameData);
    reader.onloadend = function () {
    base64String = reader.result;
    };*/
    //console.log('Base64 String - ', base64String);

    

    //let encoded = btoa(await frameData.text());

    //const base64Data = blobToBase64(frameData);
    var base64data = Buffer.from(frameData, 'binary').toString('base64');
    const signedData = signContentServer(base64data);
    let data = {frame: base64data, serverSignature: signedData};
    const jsonData = JSON.stringify(data);
    ws.send(jsonData);
  });
  
  
    // Handle WebSocket closure
    ws.addEventListener('close', () => {
      console.log('Client disconnected from WebSocket server');
      command.kill(); // Terminate the FFmpeg process
    });
  
    // Handle WebSocket errors
    ws.addEventListener('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });


  async function blobToBase64(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    await fs.writeFile('tempfile', buffer);
  
    const data = await fs.readFile('tempfile', { encoding: 'base64' });
    return data;
  }


// Create WebSocket server
const wss = new WebSocket.Server({ server });

async function verifyVideoFrames(data) {
    let valid = await verifySignature(data, cache)
   // console.log({valid})
    if (!valid) {
        console.log("Invalid frames received")
    }
}

// const streamName = "myStream";
// const rtmpUrl = `rtmp://localhost/live/${streamName}`;
const rtmpUrl = "rtmp://localhost/live/";

wss.on("connection", (ws, req) => {
    const text =req.url;
    //const text = '/?streamname=John_Doe';
const parts = text.split('='); // Split the text on the "=" character
const name = parts[1]; 
console.log(name);
    let publicKey;
    const service = require("./services/api/truYouAccount.service");
    service.getPublicKeyOfTruYouAccountByID(3).then((pk) => {
        console.log(pk);
        publicKey = pk;
    });
    const videoStream = new Readable();
    videoStream._read = () => {
    };
    let counter;

    const camera = ffmpeg()
    .input(videoStream)
    // .inputFormat('h264')
     .inputOptions('-re')
     .outputOptions('-c:v copy')
     .outputOptions('-f flv')
     .output(rtmpUrl+name);

    console.log("Streaming started");
    camera.run();

    camera.on("end", () => {
        console.log("Streaming finished");
    });

    camera.on("error", (error) => {
        console.error("Error streaming video:", error);
    });

   

    ws.on("message", async packet => {
        //let valid = await verifySignature(packet, cache)
        //ws.emit('valid-message', valid)
        const jsondata = JSON.parse(packet)
        //const payload = base64ToArrayBuffer(jsondata.payload)
        //console.log(payload);
        var buf = new Buffer(jsondata.payload, 'base64'); //
        //console.log(buf);
        const data ={
            payload: jsondata.payload,
            signature: jsondata.signature,
            username: jsondata.username,
            timestamp: jsondata.timestamp
        }
        //console.log(data);
        verifyVideoFrames(data);
        
        /*counter += 1;
        if(counter % 100 == 0){
          
            if(verifySignatureStream(signature, message)) {
                return;
            }
        } else {
            return;
        }*/
        // met publickey elke message decrypten

         videoStream.push(buf);
      //  console.log("STREAM VAN BAS: " + message);
    });

    ws.on("close", () => {
        videoStream.destroy();
        camera.kill();
    });
});

// Upgrade incoming HTTP requests to WebSocket
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function getMostRecentFile(folderPath: string): string {
    const files = fs.readdirSync(folderPath);
    let mostRecentFile = files[0];
    for (const file of files) {
        if (file > mostRecentFile) {
            mostRecentFile = file;
        }
    }
    return mostRecentFile;
}

//TODO: kan pkcmiddlware zijn functionaliteit niet aangepast worden zodat die gebruikt kan worden?

// This function takes in a public key, a signature,
// and the data that was signed.
// It returns true if the signature is valid and false otherwise.
const verifySignatureStream = (publicKey, signature, data) => {
    const verifier = createVerify("SHA256");
    verifier.update(data);
    return verifier.verify(publicKey, signature);
};

// deze is origineel voor de private key maar waarschijnlijk werkt het ook met de public key
const decryptMessage = (key, encryptedMessage) => {
    const decryptedMessage = privateDecrypt(key, encryptedMessage);
    return decryptedMessage.toString();
};
