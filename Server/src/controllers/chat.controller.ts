import { Request, Response } from 'express';
import { asyncHandler } from "../utils/asyncHandler";
import { Chat } from "../models/Chat.model";
import fs from "fs";
import mongoose from "mongoose";

// =============== 1. Upload chat JSON and merge ==================
export const uploadChatJson = asyncHandler(async (req: Request, res: Response) => {
  const { user1, user2 } = req.body;

  if (!req.file || !user1 || !user2) {
    return res.status(400).json({ message: "Missing chat file or user IDs" });
  }

  const uploadedFilePath = req.file.path;
  const rawData = fs.readFileSync(uploadedFilePath, 'utf8');
  const newMessages = JSON.parse(rawData);

  const participants = [
    new mongoose.Types.ObjectId(user1),
    new mongoose.Types.ObjectId(user2),
  ];

  let chat = await Chat.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (chat) {
    const mergedMessages = [...chat.messages, ...newMessages];

    mergedMessages.sort((a: any, b: any) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    chat.messages = mergedMessages as any;
    await chat.save();

    return res.status(200).json({ message: "Chat updated", data: chat.messages });
  } else {
    const newChat = await Chat.create({
      participants,
      messages: newMessages,
    });

    return res.status(201).json({ message: "New chat created", data: newChat.messages });
  }
});

// =============== 2. Fetch merged chat messages ==================
export const getMergedChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const { user1Id, user2Id } = req.params;

  const participants = [
    new mongoose.Types.ObjectId(user1Id),
    new mongoose.Types.ObjectId(user2Id),
  ];

  const chat = await Chat.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (!chat) {
    return res.status(404).json({ message: "No chat found between these users" });
  }

  const sortedMessages = [...chat.messages].sort((a: any, b: any) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return res.status(200).json({ message: "Chat fetched", data: sortedMessages });
});
