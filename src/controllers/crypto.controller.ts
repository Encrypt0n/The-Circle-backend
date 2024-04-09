import {randomUUID} from "node:crypto";

export async function getNonce(username: string, timestamp: Date, req) {
    let nonce = randomUUID()
    let session = req.session
    session.set(username + timestamp, nonce)
    return nonce;
}
