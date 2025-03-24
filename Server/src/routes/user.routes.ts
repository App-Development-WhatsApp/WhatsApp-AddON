import { Router } from "express";
import {
  // loginUser,
  // logoutUser,
  registerUser,
  // refreshAccessToken,
  // changeCurrentPassword,
  getCurrentUser,
  // updateAccountdetails,
  // updateUserAvatar,
  // updateUserCoverImage,
  // getuserChannelProfile,
  // getWatchHistory,
} from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(upload.single("profilePic"), registerUser);


// // logout is the controller for logout route and verifyJWT is the method want to run before perform logout
// router.route("/logout").post(verifyJWT, logoutUser);
// router.route("/refresh-token").post(refreshAccessToken);
// router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").post(verifyJWT, getCurrentUser);
// router.route("/update-account").patch(verifyJWT, updateAccountdetails);
// router
//   .route("/avatar")
//   .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
// router.route("/c/:username").get(verifyJWT, getuserChannelProfile);
// router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
