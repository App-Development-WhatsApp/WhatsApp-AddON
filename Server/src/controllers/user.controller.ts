import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from 'express';
import { ApiError } from "../utils/APIError";
import { ApiResponse } from "../utils/APIResponse";
//  this user can interact with mongodb because it has made a connection
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
// import { subscription } from "../models/subscription.model";
// import mongoose from "mongoose";
// import { Types } from "mongoose";
// import { Chat } from "../models/Chat.model";
import { getVideoDuration, splitVideo } from "../utils/Ffmpeg";
import fs from "fs";
import path from "path";

// --------------------------Register---------------------------
export const registerUser = asyncHandler(async (req: any, res: Response) => {
  const { username, fullName, phoneNumber } = req.body;

  if ([fullName, username, phoneNumber].some((field) => field?.trim() === "")) {
    return new ApiError(400, "All fields are required");
  }

  const userId = await User.findOne({ phoneNumber }).select("_id");

  if (userId) {
    return res.json(new ApiResponse(
      400,
      "User Already Exist"
    ))
  }

  const newUser = await User.create({ username: username, fullName: fullName, phoneNumber });
  console.log("New User Created:", newUser);
  if (req.files && req.files.profilePic) {
    const localFilePath = req.files.profilePic.tempFilePath;

    const avatar = await uploadOnCloudinary(localFilePath, `users/${username}/profilePic`);
    if (avatar == null) {
      await User.deleteOne(newUser._id)
      return res.json(new ApiResponse(
        400,
        "User Already Exist"
      ))
    }
    console.log("Avatar URL:", avatar.secure_url);

    await User.findByIdAndUpdate(newUser._id, { profilePic: avatar.secure_url });
  }

  const loggedInUser = await User.findById(newUser._id).select(
    " -refreshToken"
  );
  const options = {
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
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error deleting user", error: error.message });
  }
});

// // ----------------------------getCurrentUser ---------------------------------

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "Current user fetched Successfully", req.user));
});

// // ----------------------------GetAllUsers ---------------------------------

export const GetAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, "username profilePic phoneNumber _id");
  console.log("users")
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
    const user = await User.findById(userId).select("friends");
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    // Fetch the contacts (friends) of the user

    const friendIds = user.friends.map(friend => friend); // Extract chat IDs

    const friends = await User.find({ _id: { $in: friendIds } })
      .select("_id profilePic userName lastSeen online status updatedAt"); // Select only required fields

    return res
      .status(200)
      .json(new ApiResponse(200, "All chats fetched successfully", friends));

  } catch (error: any) {
    return res.status(500).json(new ApiError(500, "Internal server error", error.message));
  }
});


export const getFriends = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('friends', '_id username profilePic lastSeen online');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ friends: user.friends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------------Upload Status---------------------------------

export const UploadStatus = asyncHandler(async (req: any, res: Response) => {
  try {
    const formData = req.body;
    // console.log(req.files.files)
    const userId = formData.userId;
    // console.log('UserId:', userId);
    // const UserId = await User.findById(userId);

    console.log(formData)
    if (!req.files || !req.files.files) {
      return res.status(400).json({ success: false, message: 'No files were uploaded' });
    }

    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // console.log(file)
      // Now you can upload to Cloudinary
    }

    // if (statusArray && Array.isArray(statusArray)) {
    //   statusArray.forEach(async (stat: any, index: number) => {
    //     try {
    //       const parsedStat = JSON.parse(stat);
    //       console.log('Parsed Status:', parsedStat);

    //       if (parsedStat) {
    //         if (parsedStat.type === 'video') {
    //           const startTime = parsedStat.startTime || 0;
    //           const endTime = parsedStat.endTime || 1000;
    //           const videoPath = parsedStat.uri;


    //           // Split video into 20-second segments
    //           const videoSegments = await splitVideo(videoPath, startTime, endTime, 20);
    //           console.log('Video segments:', videoSegments);
    //           // Upload the trimmed video to Cloudinary
    //           for (const segmentPath of videoSegments) {
    //             const videoUrl = await uploadOnCloudinary(segmentPath);

    //             // Use findByIdAndUpdate to add the video status
    //             await User.findByIdAndUpdate(
    //               userId,
    //               {
    //                 $push: {
    //                   status: {
    //                     type: 'video',
    //                     caption: parsedStat.caption,
    //                     url: videoUrl.secure_url,
    //                     timeStamp: new Date(),
    //                   }
    //                 }
    //               }
    //             );
    //           }
    //         } else if (parsedStat.type === 'image' || parsedStat.type === 'image/jpeg' || parsedStat.type === 'iage/png' || parsedStat.type === 'image/jpg' || parsedStat.type === 'image/webp' || parsedStat.type === 'image/gif') {
    //           // Handle image upload to Cloudinary
    //           const imagePath = parsedStat.uri; // Assuming you have the image URI
    //           const imageUrl = await uploadOnCloudinary(imagePath);
    //           console.log('Image URL:', imageUrl.secure_url);
    //           // Update user with the new image status
    //           await User.findByIdAndUpdate(
    //             userId,
    //             {
    //               $push: {
    //                 status: {
    //                   type: 'image',
    //                   caption: parsedStat.caption,
    //                   url: imageUrl.secure_url,
    //                   timeStamp: new Date(),
    //                 }
    //               }
    //             }
    //           );
    //         }

    //         // Logging the other status properties
    //         console.log('Caption:', parsedStat.caption);
    //         console.log('Start Time:', parsedStat.startTime);
    //         console.log('End Time:', parsedStat.endTime);
    //       } else {
    //         console.log(`Status object at index ${index} is empty or undefined.`);
    //       }
    //     } catch (error) {
    //       console.log(`Error processing status at index ${index}:`, error);
    //     }
    //   })
    // } else {
    //   console.log('No status data received or status is not an array.');
    // }
    // res.status(200).json({ message: 'Status uploaded successfully' });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
})


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
// export {
//   registerUser,
//   loginUser,
//   logoutUser,
//   getCurrentUser,
//   updateAccountdetails,
//   updateUserAvatar,
//   getuserChannelProfile,
// };


// ----------------------------------Upload Files----------------------------------

export const UploadFiles = asyncHandler(async (req: any, res: Response) => {
  try {
    console.log('Request Files:');
    if (!req.files || !req.files.files) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedFiles = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];
    console.log('Uploaded Files:', uploadedFiles);
    const uploadedUrls: any = [];

    // Upload each file to Cloudinary
    for (const file of uploadedFiles) {
      console.log('File:', file);
      const cloudinaryResponse = await uploadOnCloudinary(file.tempFilePath, file.name);
      if (cloudinaryResponse) {
        uploadedUrls.push(cloudinaryResponse.secure_url);
      }
    }
    console.log('Uploaded URLs:', uploadedUrls);

    // Return the uploaded file URLs
    return res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: uploadedUrls,
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
})