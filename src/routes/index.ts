import { Router } from 'express';
// Import sub-routers
import { messageRouter } from './message.routes';
import { truYouAccountRouter } from './truYouAccount.routes';
import { logRouter } from './log.router';
import { streamSessionRouter } from './streamSession.routes';
import { router as cryptoRouter} from './crypto.routes';
import {loginRouter} from "./login.router";

const router = Router();

// Mount the router paths
router.use('/log', logRouter);
router.use('/message', messageRouter);
router.use('/streamSession', streamSessionRouter);
router.use('/truYouAccount', truYouAccountRouter);
router.use('/crypto', cryptoRouter)
router.use('/login', loginRouter)

export { router as masterRouter }