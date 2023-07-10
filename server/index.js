import express from "express";
import cors from "cors";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import bcrypt from "bcrypt";
import User from "./models/userModel.js";
import connectDB from "./ConnectDB/connect.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

// Initialize the express app
const app = express();
app.use(cookieParser());
const port = 3042;

// Enable CORS with specific origins, methods, and credentials
app.use(
  cors({
    origin: ["https://secure-mock-wallet.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Connect to the database
connectDB();

// Define the root route
app.get("/", (req, res) => {
  res.json({ message: "API working!" });
});

// Route for generating a user
app.post("/generate", async (req, res) => {
  try {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey);
    console.log(req.body);
    const slicedPublicKey = publicKey.slice(1);
    const hashedPublicKey = keccak256(slicedPublicKey);
    const ethereumAddress = toHex(hashedPublicKey.slice(-20));
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      walletAddress: `0x${ethereumAddress}`,
      privateKey: privateKey,
      password: hashedPassword,
      balance: 100,
    });

    await newUser.save();

    console.log("User created and saved to the database");
    res.status(200).send({
      message: "User created and saved",
      walletAddress: `0x${ethereumAddress}`,
    });
  } catch (error) {
    console.error("Error saving user to the database:", error);
    res.status(500).send({ message: "Error saving user to the database" });
  }
});

// Route for user login
app.post("/login", async (req, res) => {
  try {
    const { wallet, password } = req.body;
    console.log(req.body);

    const user = await User.findOne({ walletAddress: wallet });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(isPasswordValid);

      if (isPasswordValid) {
        const payload = {
          walletAddress: user.walletAddress,
          password: user.password,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.cookie("token", token, { httpOnly: true, secure: true });
        res.status(200).json({
          token: token,
          balance: user.balance,
          message: "Login successful",
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route for user logout
app.get("/logout", (req, res) => {
  res.status(200).json({
    balance: "0",
    message: "Logout successful",
  });
});

// Route for transferring funds
app.post("/transfer", async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await User.findOne({ walletAddress: decoded.walletAddress });

    const input = user.privateKey.toString();
    const numbers = input.split(",").map(Number);
    const bytes = new Uint8Array(numbers);

    const publicKey = secp256k1.getPublicKey(bytes);
    const slicedPublicKey = publicKey.slice(1);
    const hashedPublicKey = keccak256(slicedPublicKey);
    const ethereumAddress = `0x${toHex(hashedPublicKey.slice(-20))}`;

    if (user.walletAddress !== fromAccount) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (user.balance < amount) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    if (ethereumAddress === user.walletAddress) {
      const updatedBalance = user.balance - amount;

      await User.updateOne(
        { walletAddress: fromAccount },
        { balance: updatedBalance }
      );
      await User.updateOne(
        { walletAddress: toAccount },
        { $inc: { balance: amount } }
      );

      res.status(200).json({ message: "Transfer successful" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
