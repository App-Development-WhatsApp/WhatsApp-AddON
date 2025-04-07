import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  StatusBar,
} from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";

export default function UploadStatusScreen() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
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
      mediaType: MediaLibrary.MediaType.photo,
      first: 30,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
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

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const savedAsset = await MediaLibrary.createAssetAsync(result.assets[0].uri);
      await MediaLibrary.createAlbumAsync("WhatsApp Status", savedAsset, false);
      navigation.navigate("UploadImageStatus", {
        imageUri: result.assets[0].uri,
        size: result.assets[0].fileSize,
      });
    }
  };

  const selectMultipleImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    console.log("Selected images:", result.assets);

    // if (!result.canceled) {
    //   result.assets.forEach((asset) => {
    //     navigation.navigate("UploadImageStatus", {
    //       imageUri: asset.uri,
    //       size: asset.fileSize,
    //     });
    //   });
    // }
  };

  const handleLongPress = ({ uri, fileSize, mediaType }) => {
    setSelectedImages((prev) => {
      const exists = prev.some((img) => img.uri === uri);
      if (exists) {
        return prev.filter((img) => img.uri !== uri);
      } else {
        return [...prev, { uri, size: fileSize, mediaType }];
      }
    });
  };


  const UploadStatus = () => {
    navigation.navigate("UploadImageStatus", selectedImages);
  };

  const imagesWithTiles = [{ id: "camera" }, { id: "gallery" }, ...galleryImages];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />
      <Text style={styles.heading}>Upload WhatsApp Status</Text>

      <TouchableOpacity onPress={UploadStatus} style={styles.uploadButton}>
        <Text style={styles.uploadText}>📁 Upload Status</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Gallery</Text>
      <FlatList
        data={imagesWithTiles}
        numColumns={3}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        contentContainerStyle={styles.galleryList}
        renderItem={({ item }) =>
          item.id === "camera" ? (
            <TouchableOpacity onPress={takePicture} style={styles.cameraTile}>
              <Text style={styles.cameraEmoji}>📷</Text>
              <Text style={styles.cameraLabel}>Camera</Text>
            </TouchableOpacity>
          ) : item.id === "gallery" ? (
            <TouchableOpacity onPress={selectMultipleImages} style={styles.cameraTile}>
              <Text style={styles.cameraEmoji}>📁</Text>
              <Text style={styles.cameraLabel}>Phone</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                const onlyThisImage = [{ uri: item.uri, size: item.fileSize,mediaType: item.mediaType }];
                setSelectedImages(onlyThisImage);
                // navigation.navigate("UploadImageStatus", { selectedImages: onlyThisImage });
                console.log("Selected image:", item);
              }}
              onLongPress={() =>
                handleLongPress({ uri: item.uri, fileSize: item.fileSize, mediaType: item.mediaType })
              }
              style={{
                borderWidth: selectedImages.some((img) => img.uri === item.uri) ? 3 : 0,
                borderColor: "#25D366",
                borderRadius: 10,
              }}
            >
              <Image source={{ uri: item.uri }} style={styles.galleryImage} />
            </TouchableOpacity>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#075E54",
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  heading: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 10,
    marginTop: 20,
  },
  uploadButton: {
    backgroundColor: "#25D366",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    elevation: 4,
  },
  uploadText: {
    fontSize: 18,
    color: "#fff",
  },
  galleryList: {
    paddingBottom: 20,
    alignItems: "center",
  },
  galleryImage: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  cameraTile: {
    width: 100,
    height: 100,
    margin: 5,
    backgroundColor: "#128C7E",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraEmoji: {
    fontSize: 28,
    marginBottom: 5,
    color: "#fff",
  },
  cameraLabel: {
    fontSize: 12,
    color: "#fff",
  },
});
