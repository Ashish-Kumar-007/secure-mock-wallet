import mongoose from "mongoose";

async function connectDB() {
  // console.log(typeof process.env.CONNECTION_URL);
  const uri = process.env.CONNECTION_URL;
  mongoose
    .connect(
      uri,
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
