import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import {
  uploadChatJson,
  getMergedChatMessages,
} from "../controllers/chat.controller";

const router = Router();

// ------------------ Chat Sync Routes ------------------

// Upload local chat JSON file and merge on server
// Client must send `chatFile` as the uploaded JSON file
router.post("/upload", verifyJWT, upload.single("chatFile"), uploadChatJson);

// Get merged & sorted messages for 2 users
router.get("/:user1Id/:user2Id", verifyJWT, getMergedChatMessages);


// ------------------ Example Routes (You can customize or remove these) ------------------

router.post("/", (req, res) => {
  console.log("chat created");
});

router.get("/:userId", verifyJWT, () => {
  console.log("chat fetched");
});

router.get("/:chatId/messages", () => {
  console.log("chat messages fetched");
});

router.delete("/:chatId", () => {
  console.log("chat deleted");
});


// ------------------ Group Chat Routes ------------------

router.get("/group", () => {
  console.log("Group created");
});

router.get("/:groupId", () => {
  console.log("Retrieves details of a specific group, including members.");
});

router.get("/group/:chatId", verifyJWT, () => {
  console.log("chat fetched");
});

router.get("/group/:chatId/leave", verifyJWT, () => {
  console.log("chat fetched");
});

router.post("/:groupId/members", verifyJWT, () => {
  console.log("Adds a new member to a group");
});

router.post("/:groupId/members/:memberId", verifyJWT, () => {
  console.log("Removes a member from a group.");
});


// ------------------ Misc Features ------------------

router.get("/:chatId/messages/read", verifyJWT, () => {
  console.log("Read messages");
});

router.get("/:userId/unread", verifyJWT, () => {
  console.log("Unread messages");
});

export default router;
