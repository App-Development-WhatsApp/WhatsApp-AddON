import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";

export default function UploadStatusScreen() {
  const [galleryImages, setGalleryImages] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required.");
      return;
    }
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: 50,
    });

    if (media.assets.length > 0) {
      setGalleryImages(media.assets);
    }
  };

  const takePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) {
      const savedAsset = await MediaLibrary.createAssetAsync(result.assets[0].uri);
      await MediaLibrary.createAlbumAsync("WhatsApp Status", savedAsset, false);

      navigation.navigate("UploadImageStatus", { imageUri: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity onPress={takePicture} style={styles.iconButton}>
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Images</Text>
        <FlatList
          data={galleryImages}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate("UploadImageStatus", { imageUri: item.uri })}>
              <Image source={{ uri: item.uri }} style={styles.galleryImage} />
            </TouchableOpacity>)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#075E54", paddingTop: 40 },
  section: { marginBottom: 20, alignItems: "center", flexDirection: "column", justifyContent: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#ffffff" },
  iconButton: { backgroundColor: "#25D366", padding: 20, borderRadius: 50, elevation: 5 },
  iconText: { fontSize: 24, color: "#ffffff" },
  galleryImage: { width: 100, height: 100, margin: 5, borderRadius: 10, borderWidth: 2, borderColor: "#25D366" },
});
