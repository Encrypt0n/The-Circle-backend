import { Request, Response } from "express";

const service = require("../services/api/truYouAccount.service");

module.exports = {
  async postTruYouAccount(req: Request, res: Response) {
    const body = req.body;
    const result = await service.postTruYouAccount(body);
    res.status(result.status).json(result);
  },

  async getAllTruYouAccounts(req: Request, res: Response) {
    const result = await service.getAllTruYouAccounts();
    res.status(result.status).json(result);
  },

  async getAllLiveTruYouAccounts(req: Request, res: Response) {
    const result = await service.getAllLiveTruYouAccounts();
    res.status(result.status).json(result);
  },

  async getTruYouAccountByID(req: Request, res: Response) {
    const truYouAccountId = req.params.truYouAccountId;
    const result = await service.getTruYouAccountByID(truYouAccountId);
    res.status(result.status).json(result);
  },

  async postFollower(req: Request, res: Response) {
    const transparantPersonName = req.params.truYouAccountName;
    const body = req.body;
    const result = await service.postFollower(transparantPersonName, body);
    res.status(result.status).json(result);
  },

  async updateIsLive(req: Request, res: Response) {
    const truYouAccountId = req.params.truYouAccountId;
    const isLive = req.body.isLive;
    const result = await service.updateIsLive(truYouAccountId, isLive);
    res.status(result.status).json(result);
  },

  async deleteFollower(req: Request, res: Response) {
    const transparantPersonName = req.params.truYouAccountName;
    const body = req.body;
    const result = await service.deleteFollower(transparantPersonName, body);
    res.status(result.status).json(result);
  },

  async getLiveTruYouAccountByID(req: Request, res: Response) {
    const truYouAccountId = req.params.truYouAccountId;
    const result = await service.getLiveTruYouAccountByID(truYouAccountId);
    res.status(result.status).json(result);
  },

  async getTruYouAccountByName(req: Request, res: Response) {
    const truYouAccountName = req.params.truYouAccountName;
    const result = await service.getTruYouAccountByName(truYouAccountName);
    res.status(result.status).json(result);
  },

  async updateViewerCount(req: Request, res: Response) {
    const truYouAccountName = req.params.truYouAccountName;
    const viewerCount = req.body.viewerCount;
    let result;
    if (viewerCount) {
      result = await service.updateViewerCount(truYouAccountName, viewerCount);
      res.status(result.status).json(result);
    } else {
      res.status(400).json({
        status: 400,
        error: 'No viewer count specified'
      })
    }
  }
};
