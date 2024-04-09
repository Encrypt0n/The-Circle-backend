import { Router } from 'express';
const controller = require('../controllers/log.controller');
const router = Router();

router.post('/', async (req, res) => {
    await controller.postLog(req, res);
})

router.get('/', async (req, res) => {
    await controller.getAllLogs(req, res);
});

export { router as logRouter };