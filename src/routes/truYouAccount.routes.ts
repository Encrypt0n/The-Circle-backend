import { Router } from "express";
const controller = require("../controllers/truYouAccount.controller");
const router = Router();

router.post("/", async (req, res) => {
  await controller.postTruYouAccount(req, res);
});

router.get("/", async (req, res) => {
  await controller.getAllTruYouAccounts(req, res);
});

router.get("/live/", async (req, res) => {
  await controller.getAllLiveTruYouAccounts(req, res);
});

router.get("/:truYouAccountId/", async (req, res) => {
  await controller.getTruYouAccountByID(req, res);
});

router.put("/:truYouAccountName/follow", async (req, res) => {
  await controller.postFollower(req, res);
});

router.put("/:truYouAccountId/isLive/", async (req, res) => {
  await controller.updateIsLive(req, res);
});

router.delete("/:truYouAccountName/unfollow", async (req, res) => {
  await controller.deleteFollower(req, res);
});
router.get("/:truYouAccountId/isLive/", async (req, res) => {
  await controller.getLiveTruYouAccountByID(req, res);
});
router.get("/name/:truYouAccountName", async (req, res) => {
  await controller.getTruYouAccountByName(req, res);
});

router.put('/name/:truYouAccountName/updateViewerCount', async (req, res) => {
  await controller.updateViewerCount(req, res);
});

export { router as truYouAccountRouter };
