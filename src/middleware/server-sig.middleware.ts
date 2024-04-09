import {createSign} from "node:crypto";
import {readFileSync} from "node:fs"

export const serverSigMiddleware = async function (req, res, next) {
    const oldJson = res.json;
    res.json = async (body) => {
        if (!body.timestamp) {
            body.timestamp = new Date()
        }
        body.serverSignature = await signContentServer(body)
        res.locals.body = body;
        return oldJson.call(res, body);
    };
    next()
}

export const signContentServer = (body) => {
    let privateKey = readFileSync('keys/server_private.pem')

    const sign = createSign('SHA256');
    sign.update(JSON.stringify(body)).end();
    return sign.sign(privateKey).toString("hex")
}
