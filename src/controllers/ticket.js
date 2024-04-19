import { v4 as uuidv4 } from "uuid";
import TicketModel from "../models/ticket.js";

export const GET_ALL_TICKETS = async (req, res) => {
  try {
    const tickets = await TicketModel.find();

    return res.status(200).json({ tickets: tickets });
  } catch (err) {
    console.log(err);
  }
};

export const GET_TICKET_BY_ID = async (req, res) => {
  try {
    const tickets = await TicketModel.findOne({ id: req.params.id });

    return res.status(200).json({ tickets: tickets });
  } catch (err) {
    console.log(err);
  }
};

export const INSERT_TICKET = async (req, res) => {
  try {
    const ticket = new TicketModel({
      id: uuidv4(),
      userId: req.body.userId,
      developer: req.body.developer,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      imgUrl: req.body.imgUrl,
    });

    const response = await ticket.save();

    return res
      .status(200)
      .json({ ticket: response, message: "ticket was added successfully" });
  } catch (err) {
    console.log(err);
  }
};

export const GET_ALL_USER_TICKETS = async (req, res) => {
  try {
    const tickets = await TicketModel.find({ userId: req.body.userId });

    if (!tickets.length) {
      return res
        .status(404)
        .json({ message: "this user does not have any tickets" });
    }

    return res.status(200).json({ tickets: tickets });
  } catch (err) {
    console.log(err);
  }
};

export const DELETE_TICKET_BY_ID = async (req, res) => {
  try {
    const ticket = await TicketModel.findOne({ id: req.params.id });

    if (ticket.userId !== req.body.userId) {
      return res
        .status(401)
        .json({ message: "this ticket does not belong to you" });
    }

    const response = await TicketModel.deleteOne({ id: req.params.id });

    return res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
  }
};
