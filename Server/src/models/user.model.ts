import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  phoneNumber: string;
  username: string;
  profilePic: string;
  about: string;
  friends: mongoose.Types.ObjectId[];
  chats:mongoose.Types.ObjectId [];
  contacts: mongoose.Types.ObjectId[];
  groups: mongoose.Types.ObjectId[];
  communities: mongoose.Types.ObjectId[];
  followedChannels: mongoose.Types.ObjectId[];
  lastSeen: Date;
  online: boolean;
  status: { media?: string; text?: string; timestamp?: Date }[];
  callLogs: mongoose.Types.ObjectId[];
  isVerified: boolean;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
  phoneNumber: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  profilePic: { type: String, default: "" },
  about: { type: String, default: "Hey there! I am using WhatsApp." },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  chats: [ { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
  followedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }], // Channels the user follows
  lastSeen: { type: Date, default: Date.now },
  online: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  status: [{ media: String, text: String, timestamp: Date }],
  callLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Call" }],
});

// **Method to generate access token**
userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign({ userId: this._id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "40d",
  });
};

// **Method to generate refresh token**
userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign({ userId: this._id }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { User };
