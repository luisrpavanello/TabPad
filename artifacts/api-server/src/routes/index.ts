import { Router, type IRouter } from "express";
import healthRouter from "./health";
import onlineRouter from "./online";
import humanizeRouter from "./humanize";

const router: IRouter = Router();

router.use(healthRouter);
router.use(onlineRouter);
router.use(humanizeRouter);

export default router;
