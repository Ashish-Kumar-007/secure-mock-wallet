import express from "express";
import cors from "cors";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import bcrypt from "bcrypt";
import User from "./models/userModel.js";
import connectDB from "./ConnectDB/connect.js";

const app = express();
const port = process.env.PORT || 3042;

app.use(cors());
app.use(express.json());
connectDB();

app.use(function (req, res, next) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://secure-mock-wallet.vercel.app"
  );
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
  const { walletAddress, password } = req.body;

  try {
    const user = await User.findOne({ walletAddress });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        res.status(200).json({ message: "Login successful" });
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

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
