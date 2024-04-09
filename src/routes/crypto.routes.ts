import {Router} from "express";
import {getNonce} from "../controllers/crypto.controller";

const router = Router()
router.post("/nonce", async (req, res) => {
    const {username, timestamp} = req.body
    res.json({
       "nonce": await getNonce(username, timestamp, req)
    })
})

export {router}