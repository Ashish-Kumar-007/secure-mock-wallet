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
dotenv.config();
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 3042;

app.use(cors({ origin: "http://localhost:5173" }));
// app.use(cors({ origin: "https://secure-mock-wallet.vercel.app/" }));
app.use(express.json());
connectDB();

app.use(function (req, res, next) {
  // res.setHeader(
  //   "Access-Control-Allow-Origin",
  //   "https://secure-mock-wallet.vercel.app"
  // );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/generate", (req, res) => {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);
  console.log(req.body);
  const slicedPublicKey = publicKey.slice(1);
  const hashedPublicKey = keccak256(slicedPublicKey);
  const ethereumAddress = toHex(hashedPublicKey.slice(-20));
  const { password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error encrypting password:", err);
      res.status(500).send({ message: "Error encrypting password" });
    } else {
      const newUser = new User({
        walletAddress: `0x${ethereumAddress}`,
        privateKey: privateKey,
        password: hashedPassword,
        balance: 100,
      });

      newUser
        .save()
        .then(() => {
          console.log("User created and saved to the database");
          res.status(200).send({
            message: "User created and saved",
            walletAddress: `0x${ethereumAddress}`,
          });
        })
        .catch((error) => {
          console.error("Error saving user to the database:", error);
          res
            .status(500)
            .send({ message: "Error saving user to the database" });
        });
    }
  });
});

app.post("/login", async (req, res) => {
  const { wallet, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ walletAddress: wallet });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(isPasswordValid);
      if (isPasswordValid) {
        const payload = {
          walletAddress: user.walletAddress,
          password: user.password,
        };

        // Generate a token with a secret key and expiration time

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

app.get("/logout", (req, res) => {
  // res.cookie("token", null, { maxAge: "1" });
  res.status(200).json({
    balance: "0",
    message: "Logout successful",
  });
});

app.post("/transfer", async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;

    // Verify the authentication token
    const token = req.headers.authorization.split(" ")[1]; // Assuming the token is sent in the Authorization header
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    console.log(decoded);
    const user = await User.findOne({ walletAddress: decoded.walletAddress });

    const input = user.privateKey.toString();
    const numbers = input.split(",").map(Number);
    const bytes = new Uint8Array(numbers);
    // console.log(bytes);

    const publicKey = secp256k1.getPublicKey(bytes);
    const slicedPublicKey = publicKey.slice(1);
    const hashedPublicKey = keccak256(slicedPublicKey);
    const ethereumAddress = `0x${toHex(hashedPublicKey.slice(-20))}`;

    // Verify that the user is the owner of the "from" account
    if (user.walletAddress !== fromAccount) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if the user has sufficient balance for the transfer
    if (user.balance < amount) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    if (ethereumAddress === user.walletAddress) {
      // Perform the transfer
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

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
