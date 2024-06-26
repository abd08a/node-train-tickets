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

export const CREATE_TICKET = async (req, res) => {
  try {
    const ticket = new TicketModel({
      id: uuidv4(),
      title: req.body.title,
      ticket_price: req.body.ticket_price,
      from_location: req.body.from_location,
      to_location: req.body.to_location,
      to_location_photo_url: req.body.to_location_photo_url,
    });

    await ticket.save();

    return res
      .status(201)
      .json({ message: "Ticket created successfully", ticket: ticket });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
