import { Request, Response } from "express";

const service = require('../services/api/streamSession.service');

module.exports = {
    async postStreamSession(req: Request, res: Response) {
        const body = req.body;
        const result = await service.postStreamSession(body);
        res.status(result.status).json(result);
    },

    async getAllStreamSessions(req: Request, res: Response) {
        const truYouAccountId = req.query.truYouAccountId;
        let result;

        if (truYouAccountId) result = await service.getAllStreamSessionForTruYouAccount(truYouAccountId);
        else result = await service.getAllStreamSessions();
        res.status(result.status).json(result);
    }
}