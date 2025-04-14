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
} from 'react-native';
import Slider from '@react-native-community/slider';
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
  const videoRef = useRef(null);
  const totalThumbnails = 10;

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
          Alert.alert('Video selected', result.assets[0].name);
        } else {
          Alert.alert('Invalid URI', 'Please select a proper file.');
        }
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const generateThumbnails = async () => {
    if (!videoUri || duration === 0) return;

    setLoading(true);
    const interval = duration / totalThumbnails;
    const generated = [];

    try {
      for (let i = 0; i < totalThumbnails; i++) {
        const time = i * interval * 1000;
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time });
        generated.push(uri);
      }
      setThumbnails(generated);
    } catch (e) {
      console.warn('Thumbnail generation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaybackUpdate = async ({ positionMillis }) => {
    if (positionMillis / 1000 >= end) {
      await videoRef.current.pauseAsync();
      await videoRef.current.setPositionAsync(start * 1000);
    }
  };

  const playTrimmed = async () => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(start * 1000);
      await videoRef.current.playAsync();
    }
  };

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
            }}
            onPlaybackStatusUpdate={handlePlaybackUpdate}
          />

          <View style={styles.sliderContainer}>
            <Text>Start: {start.toFixed(1)}s</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={end}
              value={start}
              step={0.1}
              onValueChange={setStart}
            />

            <Text>End: {end.toFixed(1)}s</Text>
            <Slider
              style={styles.slider}
              minimumValue={start}
              maximumValue={duration}
              value={end}
              step={0.1}
              onValueChange={setEnd}
            />
          </View>

          <TouchableOpacity style={styles.playButton} onPress={playTrimmed}>
            <Text style={styles.buttonText}>▶️ Play Trimmed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={generateThumbnails}
            disabled={loading || !videoUri}
          >
            <MaterialIcons name="content-cut" size={24} color="white" />
            <Text style={styles.buttonText}>Generate Thumbnails</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}

          <ScrollView horizontal style={styles.thumbnailRow}>
            {thumbnails.map((thumb, idx) => (
              <Image key={idx} source={{ uri: thumb }} style={styles.thumbnail} />
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  video: {
    width: '100%',
    height: 220,
    marginTop: 20,
    borderRadius: 10,
  },
  sliderContainer: {
    width: '100%',
    marginTop: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  playButton: {
    marginTop: 10,
    backgroundColor: '#f57c00',
    padding: 14,
    borderRadius: 10,
  },
  thumbnailRow: {
    marginTop: 20,
    flexDirection: 'row',
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});
