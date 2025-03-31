import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export default function UploadStatusScreen() {
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access gallery is required.');
      return;
    }
    const media = await MediaLibrary.getAssetsAsync({ mediaType: 'photo', first: 20 });
    setGalleryImages(media.assets);
  };

  const takePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Take a Picture</Text>
        <TouchableOpacity onPress={takePicture} style={styles.iconButton}>
          <Text style={styles.iconText}>📷</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload Text or Voice</Text>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>📝 Upload Text</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>🎤 Upload Voice</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Gallery</Text>
        <FlatList
          data={galleryImages}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={styles.galleryImage} />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  section: { marginBottom: 20, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#ffffff' },
  iconButton: { backgroundColor: '#333', padding: 20, borderRadius: 50 },
  iconText: { fontSize: 24, color: '#ffffff' },
  optionButton: { backgroundColor: '#333', padding: 10, marginVertical: 5, borderRadius: 5 },
  optionText: { fontSize: 16, color: '#ffffff' },
  galleryImage: { width: 100, height: 100, margin: 5, borderRadius: 10 },
});