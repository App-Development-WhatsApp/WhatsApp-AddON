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

const SCREEN_WIDTH = Dimensions.get('window').width;
const TRIM_BOX_WIDTH = SCREEN_WIDTH * 0.9;

const UploadImageStatus = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const initialUri = route.params?.uri;
  const initialType = route.params?.type;

  const [selectedMedia, setSelectedMedia] = useState([{ uri: initialUri, type: initialType, caption: '' }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [trimStartPos, setTrimStartPos] = useState(0);
  const [trimEndPos, setTrimEndPos] = useState(100);

  const videoRef = useRef(null);

  const generateThumbnails = async (uri) => {
    try {
      setLoading(true);
      const thumbs = [];
  
      for (let i = 0; i < 9; i++) {
        const time = i * 1000; // default spacing (every second)
        const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(uri, { time });
        thumbs.push(thumbUri);
      }
  
      setThumbnails(thumbs);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    const mainMedia = selectedMedia[currentIndex];
    if (mainMedia?.type?.includes('video')) {
      generateThumbnails(mainMedia.uri);
    }
  }, [selectedMedia, currentIndex]);

  const handlePickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const assets = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type,
        caption: '',
      }));
      setSelectedMedia((prev) => [...prev, ...assets]);
    }
  };

  const removeMedia = (index) => {
    const updated = [...selectedMedia];
    updated.splice(index, 1);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
    setSelectedMedia(updated);
  };

  const panResponderStart = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPos = Math.min(Math.max(0, trimStartPos + gestureState.dx / 3), trimEndPos - 5);
      setTrimStartPos(newPos);
      setStart((newPos / 100) * duration);
    },
  });

  const panResponderEnd = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPos = Math.max(Math.min(100, trimEndPos + gestureState.dx / 3), trimStartPos + 5);
      setTrimEndPos(newPos);
      setEnd((newPos / 100) * duration);
    },
  });

  const formatTime = (duration) => {
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  

  const renderMediaPreview = ({ item, index }) => {
    const isImage = item.type.includes('image');
    const isSelected = index === currentIndex;
    return (
      <TouchableOpacity onPress={() => setCurrentIndex(index)}>
        <View style={[styles.mediaBox, isSelected && styles.selectedMediaBox]}>
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

  const mainMedia = selectedMedia[currentIndex];
  const isMainImage = mainMedia?.type?.includes('image');

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

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {isMainImage ? (
        <Image source={{ uri: mainMedia.uri }} style={{ flex: 1, resizeMode: 'contain' }} />
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={togglePlayPause}>
            <Video
              ref={videoRef}
              source={{ uri: mainMedia.uri }}
              style={{ flex: 1 }}
              resizeMode="contain"
              isLooping
              shouldPlay={false}
              onLoad={({ durationMillis }) => {
                setDuration(durationMillis);
                setStart(0);
                setEnd(durationMillis);
                setTrimStartPos(0);
                setTrimEndPos(100);
              }}                                          
            />
            {!isPlaying && (
              <Ionicons name="play-circle-outline" size={64} color="white" style={styles.centerPlayIcon} />
            )}
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.trimContainer}>
              <View style={styles.trimTrack}>
                <View style={[styles.overlay, { width: `${trimStartPos}%` }]} />
                <View
                  style={[
                    styles.selectedRange,
                    {
                      left: `${trimStartPos}%`,
                      width: `${trimEndPos - trimStartPos}%`,
                    },
                  ]}
                >
                  <View style={styles.handle} {...panResponderStart.panHandlers} />
                  <View style={styles.handle} {...panResponderEnd.panHandlers} />
                </View>
                <View style={[styles.overlay, { left: `${trimEndPos}%`, width: `${100 - trimEndPos}%` }]} />
                <View style={styles.trimThumbnailStrip}>
                  {thumbnails.map((thumb, idx) => (
                    <Image key={idx} source={{ uri: thumb }} style={styles.trimThumbnail} />
                  ))}
                </View>
              </View>
              <Text style={styles.trimLabel}>
                Start: {formatTime(start / 1000)} - End: {formatTime(end / 1000)}
              </Text>
            </View>
          )}
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
          value={selectedMedia[currentIndex]?.caption}
          onChangeText={(text) => {
            const updated = [...selectedMedia];
            updated[currentIndex].caption = text;
            setSelectedMedia(updated);
          }}
        />
      </View>

      <View style={styles.swipeText}>
        <Text style={{ color: '#aaa' }}>Swipe up for filters</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topIcons: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trimContainer: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    width: TRIM_BOX_WIDTH,
  },
  trimLabel: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  trimTrack: {
    height: 50,
    backgroundColor: '#222',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  selectedRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handle: {
    width: 8,
    backgroundColor: 'white',
    height: '100%',
  },
  trimThumbnailStrip: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: -1,
  },
  trimThumbnail: {
    width: TRIM_BOX_WIDTH / 9,
    height: '100%',
  },
  mediaListWrapper: {
    position: 'absolute',
    bottom: 90,
    paddingLeft: 10,
  },
  mediaBox: {
    marginRight: 8,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMediaBox: {
    borderColor: 'white',
  },
  imageThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  videoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
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
  centerPlayIcon: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  },
  captionWrapper: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  captionInput: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 10,
    color: 'white',
    fontSize: 16,
  },
  swipeText: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
});

export default UploadImageStatus;
