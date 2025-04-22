import { Router } from "express";
import {
  // loginUser,
  logoutUser,
  registerUser,
  // refreshAccessToken,
  // changeCurrentPassword,
  getCurrentUser,
  GetAllUsers,
  GetAllChattedUsers,
  getFriends,
  UploadFiles,
  // updateAccountdetails,
  // updateUserAvatar,
  // updateUserCoverImage,
  // getuserChannelProfile,
  // getWatchHistory,
  UploadStatus
} from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";
import multer from "multer";

const router = Router();

router.route("/login").post(registerUser);
router.route("/getAllUsers").get(GetAllUsers);
router.route("/getAllChattedUsers").get(GetAllChattedUsers);
router.route("/friends/:userId").post(getFriends);
router.route("/logout").post(logoutUser);
router.route("/status_Upload").post(UploadStatus)
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/send_Files").post(UploadFiles)
// router.route("/update-account").patch(verifyJWT, updateAccountdetails);
// router
//   .route("/avatar")
//   .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// router.route("/c/:username").get(verifyJWT, getuserChannelProfile);
// router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
