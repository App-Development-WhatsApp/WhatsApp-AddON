import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';

export default function VideoEditing() {
  const [videoUri, setVideoUri] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [trimStartPos, setTrimStartPos] = useState(0);
  const [trimEndPos, setTrimEndPos] = useState(100);
  const [showTrimmed, setShowTrimmed] = useState(false);

  const videoRef = useRef(null);
  const trimmedVideoRef = useRef(null);
  const totalThumbnails = 9;

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        if (uri.startsWith('file://')) {
          setVideoUri(uri);
          setThumbnails([]);
          setStart(0);
          setEnd(0);
          setDuration(0);
          setTrimStartPos(0);
          setTrimEndPos(100);
          setShowTrimmed(false);
          Alert.alert('Video selected', result.assets[0].name);
        } else {
          Alert.alert('Invalid URI', 'Please select a proper file.');
        }
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const handlePlaybackUpdate = async ({ positionMillis }) => {
    if (positionMillis / 1000 >= end) {
      await videoRef.current.pauseAsync();
      await videoRef.current.setPositionAsync(start * 1000);
    }
  };

  const handleTrimmedPlaybackUpdate = async (status) => {
    if (!status.isLoaded || !status.isPlaying) return;
    if (status.positionMillis >= end * 1000) {
      await trimmedVideoRef.current.pauseAsync();
      await trimmedVideoRef.current.setPositionAsync(start * 1000);
    }
  };

  const generateThumbnails = async (uri, videoDuration) => {
    setLoading(true);
    const thumbList = [];
    const interval = videoDuration / (totalThumbnails + 1);

    for (let i = 1; i <= totalThumbnails; i++) {
      const timestamp = i * interval;
      try {
        const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎬 Video Trimmer</Text>

      <TouchableOpacity style={styles.button} onPress={pickVideo}>
        <MaterialIcons name="video-library" size={24} color="white" />
        <Text style={styles.buttonText}>Select Video</Text>
      </TouchableOpacity>

      {videoUri && (
        <>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            useNativeControls
            resizeMode="contain"
            style={styles.video}
            onLoad={({ durationMillis }) => {
              const seconds = durationMillis / 1000;
              setDuration(seconds);
              setEnd(seconds);
              generateThumbnails(videoUri, seconds);
            }}
            onPlaybackStatusUpdate={handlePlaybackUpdate}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
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

                <View
                  style={[
                    styles.overlay,
                    {
                      left: `${trimEndPos}%`,
                      right: 0,
                      width: `${100 - trimEndPos}%`,
                    },
                  ]}
                />

                <View style={styles.trimThumbnailStrip}>
                  {thumbnails.map((thumb, idx) => (
                    <Image key={idx} source={{ uri: thumb }} style={styles.trimThumbnail} />
                  ))}
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={() => setShowTrimmed(true)}
          >
            <MaterialIcons name="play-arrow" size={24} color="white" />
            <Text style={styles.buttonText}>Show Trimmed Video</Text>
          </TouchableOpacity>

          {showTrimmed && (
            <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                Trimmed Video (From {start.toFixed(2)}s to {end.toFixed(2)}s)
              </Text>

              <Video
                ref={trimmedVideoRef}
                source={{ uri: videoUri }}
                resizeMode="contain"
                style={styles.video}
                useNativeControls={false}
                shouldPlay={false}
                onPlaybackStatusUpdate={handleTrimmedPlaybackUpdate}
                onLoad={() => {
                  if (trimmedVideoRef.current) {
                    trimmedVideoRef.current.setPositionAsync(start * 1000);
                  }
                }}
              />

              <TouchableOpacity
                style={[styles.button, { marginTop: 10 }]}
                onPress={async () => {
                  if (trimmedVideoRef.current) {
                    await trimmedVideoRef.current.setPositionAsync(start * 1000);
                    await trimmedVideoRef.current.playAsync();
                  }
                }}
              >
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text style={styles.buttonText}>Play Trimmed Section</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  video: {
    width: '100%',
    height: 200,
    marginVertical: 20,
  },
  trimContainer: {
    width: '100%',
    marginTop: 20,
    position: 'relative',
  },
  trimTrack: {
    height: 60,
    backgroundColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 2,
  },
  selectedRange: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,123,255,0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  handle: {
    width: 10,
    height: '100%',
    backgroundColor: '#007BFF',
    zIndex: 5,
  },
  trimThumbnailStrip: {
    flexDirection: 'row',
    height: 60,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  trimThumbnail: {
    flex: 1,
    height: 60,
    resizeMode: 'cover',
  },
});
