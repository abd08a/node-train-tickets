import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import TicketModel from "../models/ticket.js";

export const SIGN_IN = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const name = req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long and contain at least one number.",
      });
    }

    const user = new UserModel({
      id: uuidv4(),
      name: name,
      email: req.body.email,
      password: hash,
      bought_tickets: [],
      money_balance: req.body.money_balance,
    });

    const savedUser = await user.save();

    return res
      .status(200)
      .json({ message: "User registration successful", user: savedUser });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ message: "Bad data, validation unsuccessful" });
  }
};

export const LOG_IN = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "bad email or password" });
    }

    const isPasswordMatch = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(404).json({ message: "bad email or password" });
    }

    const jwt_token = jwt.sign(
      { email: user.email, user_id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const jwt_refresh_token = jwt.sign(
      { email: user.email, user_id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    user.isLoggedIn = true;
    await user.save();

    return res.status(200).json({
      message: "User logged in successfully",
      jwt_token: jwt_token,
      jwt_refresh_token: jwt_refresh_token,
    });
  } catch (err) {
    console.log(err);
  }
};

export const REFRESH_TOKEN = async (req, res) => {
  try {
    // Extract the refresh token from the request body
    const jwt_refresh_token = req.body.jwt_refresh_token;

    // Verify and decode the refresh token to extract user information
    jwt.verify(
      jwt_refresh_token,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(403).json({
            message: "Invalid or expired refresh token, please log in",
          });
        }

        // Extract user information from the decoded refresh token
        const { email, user_id } = decoded;

        // Use the user information to generate a new JWT token
        const jwt_token = jwt.sign({ email, user_id }, process.env.JWT_SECRET, {
          expiresIn: "2h",
        });

        // Generate a new refresh token (if needed)
        const new_jwt_refresh_token = jwt.sign(
          { email, user_id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: "1d" }
        );

        // Respond with the new JWT token and refresh token
        return res.status(200).json({
          jwt_token,
          jwt_refresh_token: new_jwt_refresh_token,
        });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const GET_ALL_USERS = async (req, res) => {
  try {
    const users = await UserModel.find().sort({ name: 1 });

    return res.status(200).json({ users: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GET_USER_BY_ID = async (req, res) => {
  try {
    // Jei vartotojas yra prisijungęs, ieškome vartotojo pagal ID
    const user = await UserModel.findOne({ id: req.params.id });

    // Jei vartotojas nerastas, grąžiname 404 klaidą
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Jei vartotojas rastas, grąžiname jį su 200 statusu
    return res.status(200).json({ user: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GET_LOGGED_IN_USERS = async (req, res) => {
  try {
    // Find all users who are logged in
    const loggedInUsers = await UserModel.find({ isLoggedIn: true });

    return res.status(200).json({ loggedInUsers: loggedInUsers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const BUY_TICKET = async (req, res) => {
  try {
    // Patikriname ar yra tiek user_id, tiek ticket_id
    const { user_id, ticket_id } = req.body;
    console.log({ user_id, ticket_id });
    if (!user_id || !ticket_id) {
      return res
        .status(400)
        .json({ message: "User ID and ticket ID are required" });
    }

    // Gauname vartotojo duomenis
    const user = await UserModel.findOne({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Gauname bilieto duomenis
    const ticket = await TicketModel.findOne({ id: ticket_id });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Patikriname ar vartotojui pakanka pinigų sąskaitos balanse
    if (user.money_balance < ticket.ticket_price) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Pridedame bilietą prie vartotojo bought_tickets masyvo
    user.bought_tickets.push(ticket_id);
    await user.save();

    // Atimame bilieto kainą iš vartotojo money_balance
    user.money_balance -= ticket.ticket_price;
    await user.save();

    return res.status(200).json({ message: "Ticket purchased successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const GET_USER_BY_ID_WITH_TICKETS = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.aggregate([
      {
        $match: { id: userId },
      },
      {
        $lookup: {
          from: "tickets", // Name of the tickets collection
          localField: "bought_tickets",
          foreignField: "id",
          as: "bought_tickets_agg",
        },
      },
    ]).exec();

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // user[0].bought_tickets = user[0].bought_tickets.map((ticket) => ticket.id);

    return res.status(200).json({ user: user[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
