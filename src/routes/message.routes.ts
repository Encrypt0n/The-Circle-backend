import { Router } from 'express';
const controller = require('../controllers/message.controller');
const router = Router();

router.post('/', async (req, res) => {
  await controller.postMessage(req, res);
});

router.get('/', async (req, res) => {
  await controller.getAllMessages(req, res);
});

router.get('/latest', async (req, res) => {
  await controller.getLatestMessages(req, res);
});

export { router as messageRouter };