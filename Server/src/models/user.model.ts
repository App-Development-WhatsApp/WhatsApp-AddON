import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  phoneNumber: string;
  username: string;
  profilePic: string;
  about: string;
  friends: mongoose.Types.ObjectId[];
  groups: mongoose.Types.ObjectId[];
  communities: mongoose.Types.ObjectId[];
  followedChannels: mongoose.Types.ObjectId[];
  lastSeen: Date;
  lastMessage: {
    text: string;
    timestamp: Date;
    seen: boolean;
  };
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
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
  followedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
  lastSeen: { type: Date, default: Date.now },
  online: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  status: [{ media: String, text: String, timestamp: Date }],
  callLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Call" }],
  lastMessage: {
    text: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
  },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { User };
