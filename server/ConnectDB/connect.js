import mongoose from "mongoose";

async function connectDB() {
  mongoose
    .connect(
      process.env.CONNECTION_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => {
      console.log("Connected to MongoDB Atlas");
      // Start your server or perform any other operations
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB Atlas:", error);
    });
}

export default connectDB;
