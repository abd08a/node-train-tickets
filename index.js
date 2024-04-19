import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import ticketRoutes from "./src/routes/ticket.js";
import userRoutes from "./src/routes/user.js";
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_CONNECTION)
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    console.log("ERR:", err);
  });

app.use(ticketRoutes);
app.use(userRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: "This endpoint does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("App started on port", process.env.PORT);
});
