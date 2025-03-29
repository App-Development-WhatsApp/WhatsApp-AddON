import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Video } from 'expo-av';
import { useNavigation, useRoute } from "@react-navigation/native";
import { ProgressBar } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";

export default function StatusViewer() {
  const navigation = useNavigation();
  const route = useRoute();
  const { video, name } = route.params;
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Auto-play the video when component mounts
    if (videoRef.current) {
      videoRef.current.playAsync();
    }

    // Set a 10-second timer to move to the next status or go back
    const timer = setTimeout(() => {
      navigation.goBack(); // Change this if navigating to the next status
    }, 10000);

    // Progress bar animation (0 to 1 in 10 seconds)
    let progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 1 ? 1 : prev + 0.1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
        <Icon name="ellipsis-vertical" size={24} color="white" />
      </View>

      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: video }}
        style={styles.video}
        resizeMode="cover"
        shouldPlay={true} // Ensures auto-play
        isLooping={false}
        useNativeControls={false} // Removes default controls
        onLoad={() => videoRef.current?.playAsync()} // Ensure it starts playing
      />

      {/* Progress Bar */}
      <ProgressBar progress={progress} color="white" style={styles.progressBar} />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.replyButton}>
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="heart-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 },
  name: { color: "white", fontSize: 16, fontWeight: "bold" },
  video: { flex: 1 },
  progressBar: { height: 5, margin: 10 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 10 },
  replyButton: { backgroundColor: "#333", padding: 10, borderRadius: 20 },
  replyText: { color: "white" }
});
