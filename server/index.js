import express, { json } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
// import User from './userModel'
import bcrypt from "bcrypt";

const app = express();
const port = process.env.PORT || 3042; // Use the provided PORT environment variable, or fallback to 3042

app.use(cors());
app.use(json());

const balances = {
  "03f45c3885e27b26dc09e8d4a717d46dd6c320ac55b1a28f25ba1e429068843689": 100,
  "0370e86516aa1e7f6cf57cd35b5a89d0aa4bf26ea7145ccdec3a38c1eefe10e30f": 50,
  "02bb610fa6a78f97af1812f4a7d853c9dd10e4a4719255b5cdb68ec5456ba04ab9": 75,
};

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/generate", (req, res) => {
  const privateKey = secp256k1.utils.randomPrivateKey();
  const publicKey = secp256k1.getPublicKey(privateKey);

  // Step 1: Slice off the first byte
  const slicedPublicKey = publicKey.slice(1);

  // Step 2: Take the keccak hash of the sliced public key
  const hashedPublicKey = keccak256(slicedPublicKey);

  // Step 3: Take the last 20 bytes of the keccak hash
  const ethereumAddress = toHex(hashedPublicKey.slice(-20));
  const { password } = req.body;

  // Encrypt the password using bcrypt
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error encrypting password:", err);
      res.status(500).send({ message: "Error encrypting password" });
    } else {
      // Create a new user instance
      const newUser = new User({
        walletAddress: `0x${ethereumAddress}`,
        password: hashedPassword,
        balance: 100,
      });

      // Save the user to the database
      newUser
        .save()
        .then(() => {
          console.log("User created and saved to the database");
          // Perform other operations as needed
          res
            .status(200)
            .send({
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

app.get("/login", async (req, res) => {
  const { walletAddress, password } = req.body;

  try {
    // Check if the wallet address exists in MongoDB
    const user = await User.findOne({ walletAddress });

    if (user) {
      // Wallet address found, compare passwords using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Password is valid, continue with login process
        // You can perform additional actions here, such as generating a token, setting a session, etc.
        res.status(200).json({ message: "Login successful" });
      } else {
        // Invalid password
        res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      // Wallet address not found
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    // Error occurred while querying MongoDB
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

// Connect to MongoDB
function connectDB() {
  mongoose
    .connect("mongodb://localhost:27017/", {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
      // Start your server or perform other operations
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
}

connectDB();

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
