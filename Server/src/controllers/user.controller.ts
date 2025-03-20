import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/APIError";
import { ApiResponse } from "../utils/APIResponse";
//  this user can interact with mongodb because it has made a connection
import { User } from "../models/user.model";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import jwt from "jsonwebtoken";
// import { subscription } from "../models/subscription.model";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import { Types } from "mongoose";

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};


// --------------------------Register---------------------------
export const registerUser = asyncHandler(async (req, res) => {
  const { username, phoneNumber, description } = req.body;

  // Validate required fields
  if ([username, phoneNumber].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "username, phoneNumber are required");
  }

  // Check if username or phone number already exists
  const existedUser = await User.findOne({ $or: [{ phoneNumber }] });

  if (existedUser) {
    throw new ApiError(409, "Username already exists");
  }

  // Create user first without image
  const newUser = await User.create({ username: username.toLowerCase(), description, phoneNumber });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser._id.toString());
  console.log(accessToken);
  console.log(refreshToken);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevents access via JavaScript (secure)
    secure: process.env.NODE_ENV === "production", // Ensures cookie is only sent over HTTPS in production
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  });

  // Send response
  return res.status(201).json(new ApiResponse(200, "User registered successfully", accessToken));
});
// ---------------------------Update Profile---------------------------
export const uploadProfilePic = asyncHandler(async (req: any, res) => {
  const userId = req.user?._id; // Get user ID from verifyJWT middleware

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  // Find the user to check if they already have a profile picture
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If user has a profile picture, delete the existing one from Cloudinary
  if (user.profilePic) {
    // Extract public_id from Cloudinary URL
    const publicId = user.profilePic.split("/").pop()?.split(".")[0];
    
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
  }

  // Upload new profile picture to Cloudinary
  const avatarLocalPath = req.file.path;
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar on Cloudinary");
  }

  // Update user profile picture URL in the database
  user.profilePic = avatar.secure_url;
  await user.save();

  return res.status(200).json({
    message: "Profile picture updated successfully",
    avatarUrl: avatar.secure_url,
  });
});




// ----------------------------LOgOut-------------------------
const logoutUser = asyncHandler(async (req, res) => {
  // Here we are using middleware to get access id at the time of logout and accessing cookie by req
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    // by true this cookkies is only accessable from server side
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user Logged Out Successfully"));
});

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

// // ----------------------------getCurrentUser ---------------------------------

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.body.user, "Current user fetched Successfully"));
});

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

export {
  //   registerUser,
  //   loginUser,
  //   logoutUser,
  //   refreshAccessToken,
  //   changeCurrentPassword,
  //   getCurrentUser,
  //   updateAccountdetails,
  // updateUserAvatar,
  //   updateUserCoverImage,
  //   getuserChannelProfile,
  //   getWatchHistory,
};
