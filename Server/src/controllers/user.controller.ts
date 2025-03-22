import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/APIError";
import { ApiResponse } from "../utils/APIResponse";
//  this user can interact with mongodb because it has made a connection
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import jwt from "jsonwebtoken";
// import { subscription } from "../models/subscription.model";
import mongoose from "mongoose";

import { Types } from "mongoose";

const generateAccessAndRefreshTokens = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // We are using validateBeforeSave to avoid validation checks on fields like password
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
  const { username, fullName, phoneNumber } = req.body;
  console.log(username)

  // Validate required fields
  if ([fullName, username, phoneNumber].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if username or phone number already exists
  const existedUser = await User.findOne({ $or: [{ phoneNumber }] });

  if (existedUser) {
    throw new ApiError(409, "Username already exists");
  }

  // Create user first without image
  // const newUser = await User.create({ username: username.toLowerCase(), fullName, phoneNumber });

  // Handle Image Upload (Optional)
  // if (req.file) {
  //   const avatarLocalPath = req.file.path;
  //   console.log("Avatar Local Path:", avatarLocalPath);

  //   // Upload to Cloudinary
  //   const avatar = await uploadOnCloudinary(avatarLocalPath);

  //   if (!avatar) {
  //     throw new ApiError(400, "Failed to upload avatar on Cloudinary");
  //   }

  //   // Update user with profile picture URL
  //   await User.findByIdAndUpdate(newUser._id, { profilePic: avatar.secure_url });
  // }

  return res.status(201).json(new ApiResponse(200, "User registered successfully"));
});

export const uploadProfilePic = asyncHandler(async (req:any, res) => {
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



// // ------------------------------Login------------------------
// const loginUser = asyncHandler(async (req, res) => {
//   // data from req->body
//   // Username email
//   //  find the user
//   // password check
//   // get access and refresh token
//   // send cookie

//   const { username, email, password } = req.body;
//   if (!(username || email)) {
//     throw new ApiError(400, "Username and Password are required");
//   }
//   // or operator find the user by email or username any one of it if found then give response
//   const user = await User.findOne({
//     $or: [{ username }, { email }],
//   });

//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }
//   // we use (User ) when we are talking about mongodb inbuild functions and use(user ) when we are using our made user
//   const isPasswordValid = await user.isPasswordCorrect(password);
//   if (!isPasswordValid) {
//     throw new ApiError(401, "INvalid User Credential");
//   }
//   const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
//     user._id
//   );

//   const loggedInUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );
//   // Makiing cookies
//   // By default cookies is changable from frontend
//   const options = {
//     // by true this cookkies is only accessable and modifiable   from server side
//     httpOnly: true,
//     secure: true,
//   };

//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           user: loggedInUser,
//           accessToken,
//           refreshToken,
//         },
//         "User Logged in successfully"
//       )
//     );
// });

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

// const getCurrentUser = asyncHandler(async (req, res) => {
//   return res
//     .status(200)
//     .json(new ApiResponse(200, req.body.user, "Current user fetched Successfully"));
// });

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
