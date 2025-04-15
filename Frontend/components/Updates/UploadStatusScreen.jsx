import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // ✅ Correct icon import for Expo
import { useNavigation } from '@react-navigation/native';

const UploadStatusScreen = () => {
  const [media, setMedia] = useState([]);


// Inside your component
const navigation = useNavigation();

const openCamera = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      navigation.navigate('UploadImageStatus', {
        uri: asset.uri,
        type: asset.type,
        // size: asset.fileSize ?? null, // fileSize is not always available
      });
    }
  } catch (error) {
    console.error('Camera Error:', error);
  }
};

const openImagePicker = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      navigation.navigate('UploadImageStatus', {
        uri: asset.uri,
        type: asset.type,
        size: asset.fileSize ?? null,
      });
    }
  } catch (error) {
    console.error('ImagePicker Error:', error);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Status</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Ionicons name="camera" size={30} color="#fff" />
          <Text style={styles.buttonText}>Take Photo/Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={openImagePicker}>
          <Ionicons name="image" size={30} color="#fff" />
          <Text style={styles.buttonText}>Upload Photo/Video</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.mediaContainer}>
        {media.map((item, index) => (
          <View key={index} style={styles.mediaItem}>
            {item?.type?.startsWith('image') || item?.type === 'image' ? (
              <Image source={{ uri: item.uri }} style={styles.mediaImage} />
            ) : (
              <Text style={styles.mediaText}>Video Selected</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  mediaContainer: {
    marginTop: 20,
    width: '100%',
  },
  mediaItem: {
    marginRight: 10,
  },
  mediaImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  mediaText: {
    color: '#000',
    fontSize: 14,
  },
});

export default UploadStatusScreen;
