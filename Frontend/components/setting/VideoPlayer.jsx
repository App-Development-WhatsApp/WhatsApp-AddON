import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Video, Audio } from "expo-av";

export default function VideoPlayer({ route }) {
  const { videoUrl } = route.params;
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupAudio() {
      // Ensure sound plays correctly
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true, // Allows sound on iOS silent mode
      });

      if (videoRef.current) {
        await videoRef.current.playAsync();
      }
    }

    setupAudio();
  }, []);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay
        isLooping
        isMuted={false} // Ensure sound is not muted
        volume={1.0} // Set max volume
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
