import { Request, Response } from "express";

const service = require('../services/api/message.service');

module.exports = {
  async postMessage(req: Request, res: Response) {
    const body = req.body;
    const result = await service.postMessage(body);
    res.status(result.status).json(result);
  },

  async getAllMessages(req: Request, res: Response) {
    const receiverId = req.query.receiverId;
    const senderId = req.query.senderId;
    let result;

    if (receiverId && senderId) result = await service.getAllMessagesForReceiverFromSender(receiverId, senderId);
    else if (receiverId) result = await service.getAllMessagesForReceiver(receiverId);
    else if (senderId) result = await service.getAllMessagesForSender(senderId);
    else result = await service.getAllMessages();
    res.status(result.status).json(result);
  },

  async getLatestMessages(req: Request, res: Response) {
    const receiver = req.query.receiverId;
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    let result;

    result = await service.getLatestMessages(receiver, limit, offset);
    res.status(result.status).json(result);
  }
}