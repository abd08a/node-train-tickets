import express from "express";
import {
  GET_ALL_TICKETS,
  GET_TICKET_BY_ID,
  DELETE_TICKET_BY_ID,
  CREATE_TICKET,
} from "../controllers/ticket.js";

import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/tickets", GET_ALL_TICKETS);
router.get("/tickets/:id", GET_TICKET_BY_ID);
router.delete("/tickets/:id", auth, DELETE_TICKET_BY_ID);
router.post("/tickets", CREATE_TICKET);

export default router;
