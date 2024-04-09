import {Router} from "express";
import {login} from "../controllers/login.controller";

const router = Router()

router.post("/", async (req, res) => {
    try {
        res.json(await login(req))
    } catch (e) {
        console.log(e)
        res.status(400).json(e)
    }
})

export {router as loginRouter}
