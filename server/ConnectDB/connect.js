import mongoose from "mongoose";

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

module.exports = connectDB