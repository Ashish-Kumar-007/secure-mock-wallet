import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    min: 8
  },
  balance: {
    type: Number,
    required: true
  }
});

const User = mongoose.model('User', userSchema);
export default User;