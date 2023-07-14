import mongoose from "mongoose";

async function connectDB() {
  console.log(process.env.PASSWORD);
  mongoose
    .connect(
      `mongodb+srv://Ashish_NFThing:${process.env.PASSWORD}@cluster0.tcmf3.mongodb.net/?retryWrites=true&w=majority`,
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
