import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/APIError";
import { ApiResponse } from "../utils/APIResponse";
//  this user can interact with mongodb because it has made a connection
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
// import { subscription } from "../models/subscription.model";
import mongoose from "mongoose";

import { Types } from "mongoose";
import { Chat } from "../models/Chat.model";

const generateAccessAndRefreshTokens = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();

    // We are using validateBeforeSave to avoid validation checks on fields like password
    await user.save({ validateBeforeSave: false });

    return accessToken;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};


// --------------------------Register---------------------------
export const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, phoneNumber } = req.body;
  // console.log(req.body.username)

  // Validate required fields
  if ([fullName, username, phoneNumber].some((field) => field?.trim() === "")) {
    return new ApiError(400, "All fields are required");
  }

  // Check if username or phone number already exists
  const userId = await User.findOne({ phoneNumber }).select("_id");

  if (userId) {
    throw new ApiError(400, "User Already exist");
  }

  // Create user first without image
  const newUser = await User.create({ username: username, fullName, phoneNumber });

  // Handle Image Upload (Optional)
  if (req.file) {
    const avatarLocalPath = req.file.path;
    // console.log("Avatar Local Path:", avatarLocalPath);

    // Upload to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Failed to upload avatar on Cloudinary");
    }

    // Update user with profile picture URL
    await User.findByIdAndUpdate(newUser._id, { profilePic: avatar.secure_url });
  }

  const loggedInUser = await User.findById(newUser._id).select(
    " -refreshToken"
  );
  // Makiing cookies
  // By default cookies is changable from frontend
  const options = {
    // by true this cookkies is only accessable and modifiable   from server side
    httpOnly: true,
    secure: true,
  };

  return res.json(new ApiResponse(
    200,
    "User Logged in successfully",
    {
      user: loggedInUser,
    },
  ))
});

export const uploadProfilePic = asyncHandler(async (req: any, res) => {
  const userId = req.user?._id; // Assuming verifyJWT middleware attaches user ID

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  // Upload file to Cloudinary
  const avatarLocalPath = req.file.path;
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar on Cloudinary");
  }

  // Update user profile picture URL
  await User.findByIdAndUpdate(userId, { profilePic: avatar.secure_url });

  return res.status(200).json({ message: "Profile picture updated successfully", avatarUrl: avatar.secure_url });
});



// // ----------------------------LOgOut-------------------------
// const logoutUser = asyncHandler(async (req, res) => {
//   // Here we are using middleware to get access id at the time of logout and accessing cookie by req
//   User.findByIdAndUpdate(
//     req.user._id,
//     {
//       $set: {
//         refreshToken: undefined,
//       },
//     },
//     {
//       new: true,
//     }
//   );

//   const options = {
//     // by true this cookkies is only accessable from server side
//     httpOnly: true,
//     secure: true,
//   };
//   return res
//     .status(200)
//     .clearCookie("accessToken", options)
//     .clearCookie("refreshToken", options)
//     .json(new ApiResponse(200, {}, "user Logged Out Successfully"));
// });
// // ----------------------------Refresh Token---------------------------------
// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const incomingrefreshToken =
//     req.cookies.refreshToken || req.body.refreshToken;
//   if (!incomingrefreshToken) {
//     throw new ApiError(401, "unauthorized request");
//   }
//   try {
//     const decodedToken = jwt.verify(
//       incomingrefreshToken,
//       process.env.REFRESH_TOKEN_SECRET || ''
//     );
//     const user = await User.findById(decodedToken?._id);
//     if (!user) {
//       throw new ApiError(401, "Invalid refresh Token");
//     }
//     if (incomingrefreshToken !== user?.refreshToken) {
//       throw new ApiError(401, " refresh Token expired or used");
//     }
//     const options = {
//       httpOnly: true,
//       secure: true,
//     };
//     const { accessToken, newrefreshToken } =
//       await generateAccessAndRefereshTokens(user._id);
//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("refreshToken", newrefreshToken, options)
//       .json(
//         new ApiError(
//           200,
//           {
//             accessToken,
//             refreshToken: newrefreshToken,
//           },
//           "Acccess Token refreshed token succesfully"
//         )
//       );
//   } catch (error) {
//     throw new ApiError(401, error?.message || "Invalid refresh Token ");
//   }
// });

// // ----------------------------changeCurrentPassword ---------------------------------

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   // password change kar pa raha hai to wo login to hai malab middleware se wo req.body le sakta hai
//   const user = await User.findById(req.body.user?._id);
//   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

//   if (!isPasswordCorrect) throw new ApiError(400, "Invalid Old Password");

//   user.password = newPassword;
//   user.save({ validateBeforeSave: false });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Password Changed Successfully"));
// });

// // ----------------------------getCurrentUser ---------------------------------

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched Successfully", req.user));
});

// // ----------------------------GetAllUsers ---------------------------------

export const GetAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "username profilePic phoneNumber _id");

  return res
    .status(200)
    .json(new ApiResponse(200, "All users fetched successfully", users));
});
// // ----------------------------GetAll ChattedUser ---------------------------------

export const GetAllChattedUsers = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    console.log(userId);

    // Fetch the user first
    const user = await User.findById(userId).select("chats");
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    // Fetch the contacts (friends) of the user

    const chatIds = user.chats.map(chat => chat); // Extract chat IDs

    const chats = await Chat.find({ _id: { $in: chatIds } })
      .select("participants lastMessage updatedAt"); // Select only required fields

    return res
      .status(200)
      .json(new ApiResponse(200, "All chats fetched successfully", {chats,}));

  } catch (error: any) {
    return res.status(500).json(new ApiError(500, "Internal server error", error.message));
  }
});


// // ----------------------------updateAccountdetails ---------------------------------

// const updateAccountdetails = asyncHandler(async (req, res) => {
//   const { fullName, email } = req.body;
//   if (!fullName || !email) {
//     throw new ApiError(400, "alll field are required");
//   }
//   const user = User.findByIdAndUpdate(
//     req.body.user?._id,
//     {
//       $set: {
//         fullName,
//         email: email,
//       },
//     },
//     { new: true }
//   ).select("-password");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Account details updated successfully"));
// });

// // ----------------------------updateUserAvatar ---------------------------------

// const updateUserAvatar = asyncHandler(async (req, res) => {
//   // HEre we are using sigle file not as route and register we were taking files instead os file
//   const avatarLocalPath = req.body.file?.path;
//   if (!avatarLocalPath) throw new ApiError(400, "Avatr file is missing");

//   // delete old Image-assignment
//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   if (!avatar.url) throw new ApiError(400, "Error while  uploading on Avatar");

//   const user = await User.findByIdAndUpdate(
//     req.body.user?._id,
//     {
//       $set: {
//         avatar: avatar.url,
//       },
//     },
//     { new: true }
//   ).select("-password");
//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "avatar Updated Successfully"));
// });

// // ----------------------------updateUserCoverImage ---------------------------------

// const updateUserCoverImage = asyncHandler(async (req, res) => {
//   // HEre we are using sigle file not as route and register we were taking files instead os file
//   const coverLocalPath = req.body.file?.path;
//   if (!coverLocalPath) throw new ApiError(400, "coverImage file is missing");

//   const coverImage = await uploadOnCloudinary(coverLocalPath);
//   if (!coverImage.url)
//     throw new ApiError(400, "Error while  uploading on coverImage");

//   const user = await User.findByIdAndUpdate(
//     req.body.user?._id,
//     {
//       $set: {
//         coverImage: coverImage.url,
//       },
//     },
//     { new: true }
//   ).select("-password");
//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "coverImage Updated Successfully"));
// });

// // ----------------------------getuserChannelProfile ---------------------------------

// const getuserChannelProfile = asyncHandler(async (req, res) => {
//   const { username } = req.params;
//   if (!username?.trim()) {
//     throw new ApiError(400, "username is missing");
//   }
//   //  Using aggregation pipeline and agggregate pipeline always return Array
//   const channel = await User.aggregate([
//     // User ko match karte hue
//     {
//       $match: {
//         username: username?.toLowerCase(),
//       },
//     },
//     // Count the numbner of subscriber
//     {
//       $lookup: {
//         from: "subscription",
//         localField: "_id",
//         foreignField: "channel",
//         as: "subscribers",
//       },
//     },
//     // Kitno ko aapne subscribe kar rakha hai
//     {
//       $lookup: {
//         from: "subscription",
//         localField: "_id",
//         foreignField: "subscriber",
//         as: "subscribedTo",
//       },
//     },
//     // original user object me kuch aur add kar diye like like subcriber subcribercount
//     {
//       $addFields: {
//         subscribersCount: {
//           $size: "$subscribers",
//         },
//         channelssubscribedToCount: {
//           $size: "$subscribedTo",
//         },
//         isSubscribed: {
//           $cond: {
//             if: { $in: [req.body.user?._id, "$Subscribers.subscriber"] },
//             then: true,
//             else: false,
//           },
//         },
//       },
//     },
//     // Kya kya hume project karna hai user ko
//     {
//       $project: {
//         fullName: 1,
//         username: 1,
//         subscribersCount: 1,
//         channelssubscribedToCount: 1,
//         isSubscribed: 1,
//         avatar: 1,
//         coverImage: 1,
//         email: 1,
//       },
//     },
//   ]);

//   if (!channel?.length) {
//     throw new ApiError(404, "Channel Doesnt exist");
//   }
//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, channel[0], "Userr Channel fetched successfully")
//     );
// });

// // ----------------------------getWatchHistory ---------------------------------

// const getWatchHistory = asyncHandler(async (req, res) => {
//   // const user = await User.aggregate([
//   //   {
//   //     $match: {
//   //       _id: new mongoose.Types.ObjectId(req.body.user._id),
//   //     },
//   //   },
//   //   {
//   //     $lookup: {
//   //       from: "Video",
//   //       localField: "watchHistory",
//   //       foreignField: "_id",
//   //       as: "watchHistory",
//   //       pipeline: [
//   //         {
//   //           $lookup: {
//   //             from: "users",
//   //             localField: "owner",
//   //             foreignField: "_id",
//   //             as: "owner",
//   //             pipeline: [
//   //               {
//   //                 $project: {
//   //                   fullName: 1,
//   //                   username: 1,
//   //                   avatar: 1,
//   //                 },
//   //               },
//   //             ],
//   //           },
//   //         },
//   //         {
//   //           $addFields: {
//   //             owner: {
//   //               $first: "$owner",
//   //             },
//   //           },
//   //         },
//   //       ],
//   //     },
//   //   },
//   // ]);

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         // user[0].watchHistory,
//         "Watch History fetched successfully"
//       )
//     );
// });

// export {
//   registerUser,
//   loginUser,
//   logoutUser,
//   refreshAccessToken,
//   changeCurrentPassword,
//   getCurrentUser,
//   updateAccountdetails,
//   updateUserAvatar,
//   updateUserCoverImage,
//   getuserChannelProfile,
//   getWatchHistory,
// };
