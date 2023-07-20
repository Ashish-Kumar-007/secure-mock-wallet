import express from "express";
import cors from "cors";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import bcrypt from "bcrypt";
import User from "./models/userModel.js";
import connectDB from "./ConnectDB/connect.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
dotenv.config();

// Initialize the express app
const app = express();
app.use(cookieParser());
const port = 3042;

// Enable CORS with specific origins, methods, and credentials
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://secure-mock-wallet.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
// app.use(
//   cors({
//     origin: "http://localhost:5173/",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//     headers: "Content-Type",
//   })
// );

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
    const message = `This account belongs to ${publicKey} with wallet address 0x${ethereumAddress}`;
    const msgByte = utf8ToBytes(message);
    const hash = keccak256(msgByte);
    console.log(`${message}: {hash}`);
    // console.log(secp256k1.sign(hash, privateKey));
    const signature = secp256k1.sign(hash, privateKey);
    const newUser = new User({
      walletAddress: `0x${ethereumAddress}`,
      publicKey: publicKey,
      r: signature.r.toString(),
      s: signature.s.toString(),
      recovery: signature.recovery,
      password: hashedPassword,
      balance: 100,
    });
    // console.log(newUser);
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
    const input = user.publicKey.toString();
    const numbers = input.split(",").map(Number);
    const publicKey = new Uint8Array(numbers);
    const message = `This account belongs to ${publicKey} with wallet address ${fromAccount}`;
    const msgByte = utf8ToBytes(message);
    const msgHash = keccak256(msgByte);
    console.log(message);
    const signature = {
      r: BigInt(user.r),
      s: BigInt(user.s),
      recovery: user.recovery,
    };
    console.log(signature);
    const verifySign = secp256k1.verify(signature, msgHash, publicKey);
    console.log(verifySign);

    if (user.walletAddress !== fromAccount) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (user.balance < amount) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    if (verifySign) {
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
