import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons"; // 3-dot menu icon

const videoData = [
  { id: "1", url: "https://www.w3schools.com/html/mov_bbb.mp4", date: "10 Mar" },
  { id: "2", url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", date: "12 Mar" },
  { id: "3", url: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", date: "15 Mar" },
  { id: "4", url: "https://samplelib.com/lib/preview/mp4/sample-15s.mp4", date: "18 Mar" },
  { id: "5", url: "https://filesamples.com/samples/video/mp4/sample_640x360.mp4", date: "22 Mar" },
  { id: "6", url: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4", date: "25 Mar" },
  { id: "7", url: "https://samplelib.com/lib/preview/mp4/sample-30s.mp4", date: "28 Mar" },
  { id: "8", url: "https://filesamples.com/samples/video/mp4/sample_1280x720.mp4", date: "30 Mar" },
  { id: "9", url: "https://samplelib.com/lib/preview/mp4/sample-20s.mp4", date: "2 Apr" },
];

export default function StatusScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);

  const openMenu = (event) => {
    setModalVisible(true);
    setMenuPosition({
      top: event.nativeEvent.pageY + 5, // Position below the 3-dot button
      left: event.nativeEvent.pageX - 50, // Align it properly
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Stories Archive</Text>
      <FlatList
        data={videoData}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.videoWrapper}>
            <TouchableOpacity
              style={styles.videoItem}
              onPress={() => navigation.navigate("VideoPlayer", { videoUrl: item.url })}
            >
              <Video
                source={{ uri: item.url }}
                style={styles.thumbnail}
                resizeMode="cover"
                isMuted
                shouldPlay={false}
              />
            </TouchableOpacity>

            {/* 3-dot Menu */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={(event) => openMenu(event)}
            >
              <Entypo name="dots-three-vertical" size={14} color="white" />
            </TouchableOpacity>

            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
        )}
      />

      {/* Pop-up Menu Positioned Below the 3-dot */}
      {modalVisible && (
        <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContainer, menuPosition]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(false)}>
              <Text style={styles.menuText}>Repost</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  videoWrapper: {
    width: "32%", // Slightly increased size
    margin: 5,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1F1F1F",
    position: "relative",
    borderWidth: 2,
    borderColor: "#3A3A3A",
  },
  videoItem: {
    width: "100%",
    borderRadius: 8,
  },
  thumbnail: {
    width: "100%",
    height: 170, // Slightly increased height
  },
  menuButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 5,
  },
  dateBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "gray",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateText: {
    color: "white",
    fontSize: 12,
  },
  modalBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContainer: {
    position: "absolute",
    backgroundColor: "#1F1F1F",
    padding: 8,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuItem: {
    padding: 1,
    alignItems: "center",
  },
  menuText: {
    color: "white",
    fontSize: 16,
  },
});

