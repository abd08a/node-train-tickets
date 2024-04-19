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

export const CREATE_TICKET = async (req, res) => {
  try {
    // Tikriname, ar yra pateikti visi būtini bilieto duomenys
    const {
      title,
      ticket_price,
      from_location,
      to_location,
      to_location_photo_url,
    } = req.body;
    if (
      !title ||
      !ticket_price ||
      !from_location ||
      !to_location ||
      !to_location_photo_url
    ) {
      return res
        .status(400)
        .json({ message: "All ticket details are required" });
    }

    // Sukuriame naują bilietą
    const ticket = new TicketModel({
      id: uuidv4(),
      title: title,
      ticket_price: ticket_price,
      from_location: from_location,
      to_location: to_location,
      to_location_photo_url: to_location_photo_url,
    });

    // Išsaugome bilietą į duomenų bazę
    await ticket.save();

    return res
      .status(201)
      .json({ message: "Ticket created successfully", ticket: ticket });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
