import axios from "axios";
import * as FileSystem from "expo-file-system";
import { userFilePath, friendsFilePath } from "./chatStorage";
import { addUser } from "../database/curd";

export const API_URL = `http://192.168.0.209:5000/api/v1/users`; // Replace with your backend URL
// export const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/users`; // Replace with your backend URL


// -------------------- LOGIN --------------------
export const login = async (formData) => {

  try {
    // console.log(formData)
    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
    console.log(response.data, "response")

    if (response.data.success && response.data.data?.user) {
      await addUser(response.data.data.user)
      return { success: true, user: response.data.data.user };
    } else {
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    }
  } catch (error) {
    return handleError(error);
  }
};

// -------------------- GET ALL USERS --------------------
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/getAllUsers`);
    return {
      success: true,
      users: response.data.data || [],
    };
  } catch (error) {
    return handleError(error);
  }
};

// -------------------- OPTIONAL: GET USER PROFILE --------------------
export const getProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/profile/${userId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

// -------------------- LOGOUT --------------------
export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`);

    if (response.data.success) {
      // Delete user and friends JSON files locally
      await FileSystem.deleteAsync(userFilePath, { idempotent: true });
      await FileSystem.deleteAsync(friendsFilePath, { idempotent: true });
      console.log("User logged out and local data deleted.");
      return { success: true, message: "Logged out successfully" };
    } else {
      return { success: false, message: "Logout failed from API" };
    }
  } catch (error) {
    return {
      success: false,
      message: "Error logging out",
      error: error.message,
    };
  }
};

// -------------------- ERROR HANDLER --------------------
const handleError = (error) => {
  if (error.response) {
    return {
      success: false,
      message: error.response.data?.message || "Server error occurred.",
      status: error.response.status,
      errors: error.response.data?.errors || [],
    };
  } else if (error.request) {
    return {
      success: false,
      message: "No response from the server. Please check your internet connection.",
      status: null,
    };
  } else {
    return {
      success: false,
      message: `Request error: ${error.message}`,
      status: null,
    };
  }
};



// -------------------- UPLOAD STATUS -----------------------

export const uploadStatus = async (formData) => {
  try {
    console.log("formData", formData)
    const response = await axios.post(`${API_URL}/status_Upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept':'application/json'
      },
    });
    console.log(response.data, "response")

    if (response.data.success) {
      return { success: true, message: "Status uploaded successfully" };
    }
    else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    return handleError(error);
  }
}


// ---------------------SendFiles----------------------------

export const sendFiles = async (selectedFiles) => {
  try {
    const formData = new FormData();
    
    // Add each file to the formData
    selectedFiles.forEach(file => {
      formData.append('files', {
        uri: file.uri,
        name: file.fileName || 'file.jpg',
        type: file.mimeType || 'image/jpeg',
      });
    });
    console.log("selectedFiles",formData)

    console.log("formData", formData._parts[0]);
    const response = await axios.post(`${API_URL}/send_Files`,formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
    console.log(response.data.data, "response")

    if (response.data.success) {
      return { success: true, message: "Status uploaded successfully",response: response.data.data };
    }
    else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    return handleError(error);
  }
};