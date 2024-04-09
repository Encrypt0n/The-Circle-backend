import { Router } from 'express';
const controller = require('../controllers/streamSession.controller');
const router = Router();

router.post('/', async (req, res) => {
    await controller.postStreamSession(req, res);
})

router.get('/', async (req, res) => {
    await controller.getAllStreamSessions(req, res);
});

export { router as streamSessionRouter };