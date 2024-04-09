import {createPublicKey, createVerify, KeyObject} from "node:crypto";
import {truYouAccountRepository} from "../utils/datasources/mysql.datasource";
import {TruYouAccount} from "../models/entities/TruYouAccount";
import {DigitalSignature} from "../models/DigitalSignature";

const repository = truYouAccountRepository;

export const PKCMiddleware = async function (req, res, next) {
    if (req.url === "/api/crypto/nonce" || await verifySignature(req.body, req.session)) {
        next()
    } else {
        res.statusCode = 401
        res.send({
            "statusCode": 401,
            "result": "No Authentication and Integrity"
        })
    }
}


export async function verifySignature<DATA>(data: DigitalSignature<DATA>, cache): Promise<boolean> {
    let account: TruYouAccount
    let publicKey: Buffer
    let key: KeyObject

    if (data.payload["username"] && data.payload["username"] !== data.username) {
        return false
    }

    try {
        account = await getTruYouAccountByName(data.username)
        publicKey = Buffer.from(account.publicKey)
        key = createPublicKey(publicKey)
    } catch (e) {
        console.log(e)
        return false;
    }

    let nonce = getNonce(cache, data.username, data.timestamp)

    const verify = createVerify("SHA256")
        .update(nonce + ";" + JSON.stringify(data.payload))
        .end();

    return verify.verify(key, Buffer.from(data.signature, "hex"))
}


async function getTruYouAccountByName(username: string) {
    return repository.findOneBy({
        name: username
    });
}

function getNonce(cache, username: string, timestamp: Date): string {
    return cache.take(username+timestamp)
}