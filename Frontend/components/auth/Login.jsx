import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { login } from "../../Services/AuthServices";
import { loadUserInfo } from "../../utils/chatStorage";

const LoginScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // navigation.replace("Main");
    const checkAuth = async () => {
      const userInfo = await loadUserInfo();
      // console.log(userInfo, "userInfo---");
      if (userInfo) {
        navigation.replace("Main");
      }
    };

    checkAuth();

    const backAction = () => {
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.type === "cancel") return;

      const imageUri = result.assets[0].uri;
      setProfilePic(imageUri);
    } catch (error) {
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const handleLogin = async () => {
    if (!fullName || !username || !phoneNumber) {
      Alert.alert("Error", "Please fill in all fields and select a profile picture.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("username", username);
    formData.append("phoneNumber", phoneNumber);

    if (profilePic) {
      const filename = profilePic.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : "image";

      formData.append("profilePic", {
        uri: profilePic,
        name: filename,
        type: fileType,
      });
    }

    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      navigation.replace("Main");
    } else {
      Alert.alert("Login Failed", result.message || "An error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to WhatsChat</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={{ color: "#888" }}>+</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
        placeholderTextColor="#666"
        style={styles.input}
      />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#666"
        style={styles.input}
      />
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        placeholderTextColor="#666"
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#25D366" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5F4EC",
    paddingHorizontal: 30,
    paddingTop: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#075E54",
    marginBottom: 30,
  },
  imagePicker: {
    marginBottom: 25,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#25D366",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 40,
    borderColor: "#aaa",
    borderWidth: 1,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  loginButton: {
    backgroundColor: "#25D366",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LoginScreen;
