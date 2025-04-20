import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
  BackHandler
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { login } from "../../Services/AuthServices";
import { loadUserInfo } from "../../utils/chatStorage";
import FormData from "form-data";
import { addUser, getUserInfoById } from "../../database/curd";
import localStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';


const LoginScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;



  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const checkAuth = async () => {
      const userId = await localStorage.getItem('userId')
      const user = await getUserInfoById(userId);
      console.log(userId, user)
      if (user) {
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

    if (result.success) {
      await localStorage.setItem('userId', result.user._id);
      setLoading(false);
      navigation.replace("Main");
    } else {
      Alert.alert("Login Failed", result.message || "An error occurred.");
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.brand}>WhatsChat</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.plus}>+</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        style={styles.input}
      />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#aaa"
        style={styles.input}
      />
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#25D366" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 30,
    paddingTop: 70,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#CCCCCC",
    marginBottom: 5,
  },
  brand: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#25D366",
    marginBottom: 25,
  },
  imagePicker: {
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#25D366",
    borderRadius: 70,
    padding: 4,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2C2C2C",
    justifyContent: "center",
    alignItems: "center",
  },
  plus: {
    fontSize: 40,
    color: "#666",
  },
  input: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  loginButton: {
    backgroundColor: "#25D366",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    elevation: 3,
  },
  loginButtonText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default LoginScreen;