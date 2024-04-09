import { Request, Response } from "express";

const service = require('../services/api/log.service');

module.exports = {
  async postLog(req: Request, res: Response) {
    const body = req.body;
    const result = await service.postLog(body);
    res.status(result.status).json(result);
  },

  async getAllLogs(req: Request, res: Response) {
    const truYouAccountId = req.query.truYouAccountId;        
    let result;

    if (truYouAccountId) result = await service.getAllLogsForTruYouAccount(truYouAccountId);
    else result = await service.getAllLogs();
    res.status(result.status).json(result);
  }
}