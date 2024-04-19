import express from "express";
import {
  SIGN_IN,
  LOG_IN,
  REFRESH_TOKEN,
  GET_ALL_USERS,
  GET_USER_BY_ID,
  GET_LOGGED_IN_USERS,
} from "../controllers/user.js";

import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/users", SIGN_IN);
router.post("/users/login", auth, LOG_IN);
router.post("/users/refresh", REFRESH_TOKEN);
router.get("/users", GET_ALL_USERS);
router.get("/users/logged", GET_LOGGED_IN_USERS);
router.get("/users/:id", GET_USER_BY_ID);

export default router;