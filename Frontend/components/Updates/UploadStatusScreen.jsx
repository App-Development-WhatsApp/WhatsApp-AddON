import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const UploadStatusScreen = () => {
  const [media, setMedia] = useState([]);
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
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>Recents</Text>
      </View>

      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.gridItem} onPress={openCamera}>
          <Ionicons name="camera" size={40} color="#0f0" />
          <Text style={styles.gridLabel}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridItem} onPress={openImagePicker}>
          <Ionicons name="image" size={40} color="#0f0" />
          <Text style={styles.gridLabel}>Upload</Text>
        </TouchableOpacity>

        {[...media.slice(0, 4)].map((item, index) => (
          <View key={index} style={styles.gridItem}>
            {item?.type?.startsWith('image') ? (
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            ) : (
              <Text style={styles.videoText}>Video</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    paddingTop: 40,
    paddingHorizontal: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  gridItem: {
    width: '30%',
    height: 100,
    backgroundColor: '#222',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  gridLabel: {
    color: '#0f0',
    fontSize: 12,
    marginTop: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  videoText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default UploadStatusScreen;
