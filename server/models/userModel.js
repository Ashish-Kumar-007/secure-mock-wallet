import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  publicKey: {
    type: String,
    required: true,
    unique: true,
  },
  r: {
    type: String,
    required: true,
    unique: true,
  },
  s: {
    type: String,
    required: true,
    unique: true,
  },
  recovery:{
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
