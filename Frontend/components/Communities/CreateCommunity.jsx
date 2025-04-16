import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function CommunityFlow({ navigation }) {
  const [currentPage, setCurrentPage] = useState("Page1");
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState(
    "Hi everyone! This community is for members to chat in topic-based groups and get important announcements."
  );
  const [photo, setPhoto] = useState(null);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Please grant media access to pick a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!communityName.trim()) {
      Alert.alert("Community name required", "Please enter a name to continue.");
      return;
    }

    const newCommunity = {
      name: communityName.trim(),
      description: description.trim(),
      photo: photo || null,
    };

    const fileUri = `${FileSystem.documentDirectory}communities.json`;

    try {
      let existingData = [];
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const jsonData = await FileSystem.readAsStringAsync(fileUri);
        existingData = JSON.parse(jsonData);
      }

      existingData.push(newCommunity);
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(existingData, null, 2));

      navigation.pop(2); // Go back 2 pages to Communities screen
    } catch (error) {
      console.error("Error saving community:", error);
      Alert.alert("Error", "Something went wrong while saving the community.");
    }
  };

  const navigate = (page) => {
    setCurrentPage(page);
  };

  if (currentPage === "Page1") {
    return (
      <View style={styles.page1.container}>
        <View style={styles.page1.crossContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.page1.imageContainer}>
          <Image
            source={{
              uri:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/User_icon_BLACK-01.png/480px-User_icon_BLACK-01.png",
            }}
            style={styles.page1.image}
          />
        </View>
        <Text style={styles.page1.title}>Create a new community</Text>
        <Text style={styles.page1.subtitle}>
          Bring together a neighbourhood, school or more. Create topic-based groups for
          members, and easily send them admin announcements.
        </Text>
        <TouchableOpacity style={styles.page1.exampleContainer}>
          <Text style={styles.page1.exampleText}>See example communities</Text>
          <Ionicons name="chevron-forward" size={20} color="#0A84FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.page1.getStartedButton}
          onPress={() => navigate("Page2")}
        >
          <Text style={styles.page1.getStartedText}>Get started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentPage === "Page2") {
    return (
      <View style={styles.page2.container}>
        <View style={styles.page2.header}>
          <TouchableOpacity onPress={() => navigate("Page1")}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.page2.headerTitle}>New community</Text>
        </View>

        <View style={styles.page2.examplesContainer}>
          <Text style={styles.page2.examplesText}>
            See <Text style={styles.page2.examplesHighlight}>examples</Text> of different communities
          </Text>
        </View>

        <View style={styles.page2.photoContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.page2.photo} />
          ) : (
            <MaterialCommunityIcons
              name="account-group"
              size={100}
              color="white"
              style={{
                padding: 10,
                backgroundColor: "#6b7378",
                borderRadius: 20,
              }}
            />
          )}
          <TouchableOpacity style={styles.page2.addPhotoButton} onPress={handleImagePick}>
            <MaterialIcons name="photo-camera" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.page2.changePhotoText}>Change photo</Text>
        </View>

        <View style={styles.page2.inputContainer}>
          <TextInput
            style={styles.page2.input}
            placeholder="Community name"
            placeholderTextColor="#888"
            value={communityName}
            onChangeText={setCommunityName}
            maxLength={100}
          />
          <Text style={styles.page2.counterText}>{communityName.length}/100</Text>
        </View>

        <View style={styles.page2.descriptionContainer}>
          <TextInput
            style={styles.page2.descriptionInput}
            multiline
            value={description}
            onChangeText={setDescription}
            maxLength={2048}
          />
          <Text style={styles.page2.counterText}>{description.length}/2048</Text>
        </View>

        <TouchableOpacity style={styles.page2.fab} onPress={handleCreate}>
          <Ionicons name="arrow-forward" size={28} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#121212", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white" }}>No Page</Text>
    </View>
  );
}

const styles = {
  page1: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212",
      alignItems: "center",
      paddingTop: 80,
      paddingHorizontal: 24,
    },
    crossContainer: {
      position: "absolute",
      top: 40,
      left: 20,
    },
    imageContainer: {
      marginBottom: 24,
    },
    image: {
      width: 160,
      height: 160,
      resizeMode: "contain",
    },
    title: {
      color: "#FFFFFF",
      fontSize: 25,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 16,
    },
    subtitle: {
      color: "#AEBAC1",
      fontSize: 15,
      textAlign: "center",
      marginTop: 12,
      marginHorizontal: 40,
      lineHeight: 20,
    },
    exampleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 18,
    },
    exampleText: {
      color: "#53BDEB",
      fontSize: 14,
      fontWeight: "500",
      marginRight: 4,
    },
    getStartedButton: {
      backgroundColor: "#25D366",
      borderRadius: 30,
      paddingVertical: 14,
      paddingHorizontal: 80,
      position: "absolute",
      bottom: 36,
    },
    getStartedText: {
      color: "#000000",
      fontSize: 16,
      fontWeight: "600",
    },
  }),

  page2: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212",
      paddingTop: 50,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    headerTitle: {
      color: "white",
      fontSize: 20,
      fontWeight: "600",
      marginLeft: 16,
    },
    examplesContainer: {
      alignItems: "center",
      marginTop: 8,
      marginBottom: 24,
    },
    examplesText: {
      color: "#AEBAC1",
      fontSize: 13,
    },
    examplesHighlight: {
      color: "#53BDEB",
    },
    photoContainer: {
      alignItems: "center",
      marginBottom: 28,
    },
    photo: {
      width: 100,
      height: 100,
      borderRadius: 20,
      backgroundColor: "#2C2C2E",
    },
    addPhotoButton: {
      backgroundColor: "#25D366",
      padding: 7,
      width: 40,
      height: 40,
      borderRadius: 20,
      position: "absolute",
      bottom: 10,
      right: 110,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#121212",
    },
    changePhotoText: {
      color: "#AEBAC1",
      fontSize: 14,
      marginTop: 8,
    },
    inputContainer: {
      marginBottom: 20,
    },
    input: {
      borderBottomWidth: 1,
      borderBottomColor: "#25D366",
      color: "white",
      fontSize: 16,
      paddingVertical: 10,
    },
    counterText: {
      color: "#5C5C5C",
      fontSize: 12,
      textAlign: "right",
      marginTop: 4,
    },
    descriptionContainer: {
      marginBottom: 40,
    },
    descriptionInput: {
      borderWidth: 1,
      borderColor: "#2C2C2E",
      borderRadius: 8,
      color: "white",
      fontSize: 15,
      padding: 12,
      minHeight: 100,
      textAlignVertical: "top",
    },
    fab: {
      backgroundColor: "#25D366",
      width: 54,
      height: 54,
      borderRadius: 27,
      position: "absolute",
      bottom: 30,
      right: 24,
      justifyContent: "center",
      alignItems: "center",
    },
  }),
};
