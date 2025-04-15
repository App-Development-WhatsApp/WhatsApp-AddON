import mongoose, { Schema, Document, Model } from "mongoose";
import jwt from "jsonwebtoken";

// Replace with your actual secret keys
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your-access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";

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
  online: boolean;
  isVerified: boolean;
  status: { type: string; uri: string; caption?: string; timestamp?: Date }[];
  callLogs: mongoose.Types.ObjectId[];
  lastMessage: {
    text: string;
    timestamp: Date;
    seen: boolean;
  };
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    phoneNumber: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    profilePic: { type: String, default: "" },
    about: { type: String, default: "Hey there! I am using WhatsApp." },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Community" }],
    followedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
    lastSeen: { type: Date, default: Date.now },
    online: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    status: [{ type: String, uri: String, caption: String, timestamp: Date }],
    callLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Call" }],
    lastMessage: {
      text: { type: String, default: "" },
      timestamp: { type: Date, default: Date.now },
      seen: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// // Generate access token
// userSchema.methods.generateAccessToken = function (): string {
//   return jwt.sign(
//     { id: this._id, phoneNumber: this.phoneNumber },
//     ACCESS_TOKEN_SECRET,
//     { expiresIn: "1h" }
//   );
// };

// // Generate refresh token
// userSchema.methods.generateRefreshToken = function (): string {
//   return jwt.sign(
//     { id: this._id, phoneNumber: this.phoneNumber },
//     REFRESH_TOKEN_SECRET,
//     { expiresIn: "7d" }
//   );
// };

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export { User, IUser };
