import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Ionicons, Entypo, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { uploadStatus } from '../../../Services/AuthServices';
import { loadUserInfo } from '../../../utils/chatStorage';


const SCREEN_WIDTH = Dimensions.get('window').width;

const UploadImageStatus = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [selectedMedia, setSelectedMedia] = useState([
    {
      uri: route.params?.uri,
      type: route.params?.type,
      caption: '',
      startTime: 0,
      endTime: 1000,
      duration: 1000,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null); // Assuming you have a way to get user data

  const videoRef = useRef(null);
  const currentMedia = selectedMedia[currentIndex];
  const startPercent = (currentMedia.startTime / currentMedia.duration) * 100;
  const endPercent = (currentMedia.endTime / currentMedia.duration) * 100;

  const generateThumbnails = async () => {
    setLoading(true);
    const thumbList = [];
    const interval = currentMedia.duration / 10;

    for (let i = 1; i <= 9; i++) {
      const timestamp = i * interval;
      try {
        const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(currentMedia.uri, {
          time: timestamp * 1000,
        });
        thumbList.push(thumbnailUri);
      } catch (e) {
        console.warn(`Could not generate thumbnail at ${timestamp}s`, e);
      }
    }

    setThumbnails(thumbList);
    setLoading(false);
  };
  useEffect(() => {
    const fetchUserData = async () => {
      // Assuming you have a function to get user data
      const user = await loadUserInfo(); // Replace with your actual function
      setUserData(user);
    };

    fetchUserData();
  }, [])
  useEffect(() => {
    if (currentMedia.type === 'video') {
      generateThumbnails();
    }
  }, [currentIndex]);

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    result.assets?.forEach((item) => {
      const newData = {
        uri: item.uri,
        type: item.type,
        caption: '',
        startTime: 0,
        endTime: item.duration || 1000,
        duration: item.duration || 1000,
      };
      setSelectedMedia((prev) => [...prev, newData]);
    });
  };

  const removeMedia = (index) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const panResponderStart = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const deltaMs = (gestureState.dx / SCREEN_WIDTH) * currentMedia.duration;
      const newPos = Math.min(Math.max(0, currentMedia.startTime + deltaMs), currentMedia.endTime - 5);
      setSelectedMedia((prev) =>
        prev.map((item, index) => index === currentIndex ? { ...item, startTime: newPos } : item)
      );
    },
  });

  const panResponderEnd = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const deltaMs = (gestureState.dx / SCREEN_WIDTH) * currentMedia.duration;
      const newPos = Math.max(
        Math.min(currentMedia.duration, currentMedia.endTime + deltaMs),
        currentMedia.startTime + 5
      );
      setSelectedMedia((prev) =>
        prev.map((item, index) => index === currentIndex ? { ...item, endTime: newPos } : item)
      );
    },
  });

  const formatTime = (duration) => {
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaPreview = ({ item, index }) => {
    const isImage = item.type.includes('image');
    return (
      <TouchableOpacity onPress={() => {
        setCurrentIndex(index);
        // console.log(selectedMedia[index], "selectedMedia[index]")
      }}>
        <View style={[styles.mediaBox, index === currentIndex && styles.selectedMediaBox]}>
          {isImage ? (
            <Image source={{ uri: item.uri }} style={styles.imageThumb} />
          ) : (
            <View style={styles.videoWrapper}>
              <Video source={{ uri: item.uri }} style={styles.videoThumb} resizeMode="cover" isMuted shouldPlay={false} />
              <Ionicons name="play-circle-outline" size={24} color="white" style={styles.playIcon} />
            </View>
          )}
          <TouchableOpacity style={styles.deleteButton} onPress={() => removeMedia(index)}>
            <Ionicons name="close-circle" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleUploadStatus = async () => {
    setUploading(true);

    const formData = new FormData();
    formData.append('userId', userData._id); // Assuming you have user data

    selectedMedia.forEach((item, index) => {
      const fileExtension = item.uri.split('.').pop();
      const mimeType = item.type === 'video'
        ? `video/${fileExtension}`
        : `image/${fileExtension}`;

      formData.append('status', {
        uri: item.uri,
        type: mimeType,
        name: `upload_${index}.${fileExtension}`,
      });

      formData.append(`caption_${index}`, item.caption);
      formData.append(`startTime_${index}`, item.startTime);
      formData.append(`endTime_${index}`, item.endTime);
    });

    try {
      console.log('Uploading status...');
      const response = await uploadStatus(formData);
      // const result = await response.json();
      console.log('Upload success:', response);
    } catch (error) {
      console.log('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {currentMedia.type.includes('image') ? (
        <Image source={{ uri: currentMedia.uri }} style={{ flex: 1, resizeMode: 'contain' }} />
      ) : (
        <View style={{ flex: 1 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.trimContainer}>
              <View style={styles.trimTrack}>
                <View style={[styles.overlay, { width: `${startPercent}%` }]} />
                <View style={[
                  styles.selectedRange,
                  {
                    left: `${startPercent}%`,
                    width: `${endPercent - startPercent}%`,
                  }]}>
                  <View style={[styles.handle, { left: 0 }]} {...panResponderStart.panHandlers} />
                  <View style={[styles.handle, { right: 0 }]} {...panResponderEnd.panHandlers} />
                </View>
                <View style={[styles.overlay, { left: `${endPercent}%`, width: `${100 - endPercent}%` }]} />
                <View style={styles.trimThumbnailStrip}>
                  {thumbnails.map((thumb, idx) => (
                    <Image key={idx} source={{ uri: thumb }} style={styles.trimThumbnail} />
                  ))}
                </View>
              </View>
              <Text style={styles.trimLabel}>
                Start: {formatTime(currentMedia.startTime / 1000)} - End: {formatTime(currentMedia.endTime / 1000)}
              </Text>
            </View>
          )}
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={togglePlayPause}>
            <Video
              ref={videoRef}
              source={{ uri: currentMedia.uri }}
              style={{ flex: 1 }}
              resizeMode="contain"
              isLooping
              shouldPlay={false}
            />
            {!isPlaying && (
              <Ionicons name="play-circle-outline" size={64} color="white" style={styles.centerPlayIcon} />
            )}
          </TouchableOpacity>

        </View>
      )}

      <View style={styles.topIcons}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <Entypo name="music" size={24} color="white" />
          <MaterialCommunityIcons name="sticker-emoji" size={24} color="white" />
          <Feather name="edit-3" size={24} color="white" />
          <Ionicons name="text" size={24} color="white" />
        </View>
      </View>

      {selectedMedia.length > 1 && (
        <View style={styles.mediaListWrapper}>
          <FlatList
            data={selectedMedia}
            horizontal
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            renderItem={renderMediaPreview}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={styles.captionWrapper}>
        <Ionicons name="add-circle-outline" size={26} color="#ccc" onPress={handlePickMedia} />
        <TextInput
          placeholder="Add a caption..."
          placeholderTextColor="#ccc"
          style={styles.captionInput}
          value={currentMedia.caption}
          onChangeText={(text) => {
            const updated = [...selectedMedia];
            updated[currentIndex].caption = text;
            setSelectedMedia(updated);
          }}
        />
      </View>

      <TouchableOpacity disabled={uploading} style={styles.sendButton} onPress={handleUploadStatus}>
        {uploading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.sendText}>Upload Status</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mediaBox: {
    margin: 6,
    position: 'relative',
  },
  selectedMediaBox: {
    borderColor: '#00f',
    borderWidth: 2,
  },
  imageThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  videoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
  },
  playIcon: {
    position: 'absolute',
    top: 18,
    left: 18,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
  },
  centerPlayIcon: {
    position: 'absolute',
    top: '45%',
    left: '45%',
  },
  trimContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  trimTrack: {
    height: 60,
    backgroundColor: '#222',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 60,
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  selectedRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  handle: {
    width: 10,
    height: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
  },
  trimThumbnailStrip: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  trimThumbnail: {
    width: SCREEN_WIDTH / 10,
    height: '100%',
  },
  trimLabel: {
    marginTop: 8,
    color: '#ccc',
    textAlign: 'center',
  },
  topIcons: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaListWrapper: {
    position: 'absolute',
    bottom: 130,
    width: '100%',
    paddingVertical: 10,
  },
  captionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  captionInput: {
    color: '#fff',
    flex: 1,
    marginLeft: 10,
  },
  sendButton: {
    backgroundColor: '#1e90ff',
    padding: 12,
    alignItems: 'center',
  },
  sendText: {
    color: 'white',
    fontSize: 16,
  },
});

export default UploadImageStatus;
