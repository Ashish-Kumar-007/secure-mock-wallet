import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config({});

const uri = process.env.CONNECTION_URI;

async function connectDB() {
  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB Atlas");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB Atlas:", error);
    });
}

export default connectDB;
