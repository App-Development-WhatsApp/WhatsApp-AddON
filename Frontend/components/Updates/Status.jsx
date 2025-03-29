import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const statuses = [
  { id: "1", name: "Sahil", profile: require("../../assets/images/tomi.png"), thumbnail: require("../../assets/images/blank.jpeg"), video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "2", name: "Sajal", profile: require("../../assets/images/samuel.jpg"), thumbnail: require("../../assets/images/blank.jpeg"), video: "https://www.w3schools.com/html/mov_bbb.mp4" }
];

const screenWidth = Dimensions.get("window").width;

export default function StatusList() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={statuses}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.statusBox}
            onPress={() => navigation.navigate("StatusViewer", { video: item.video, name: item.name })}
          >
            {/* Status Thumbnail with Border */}
            <View style={styles.statusThumbnail}>
              <Image source={item.thumbnail} style={styles.thumbnail} />

              {/* Profile Image in Corner */}
              <View style={styles.profileContainer}>
                <Image source={item.profile} style={styles.profileImage} />
              </View>
            </View>

            {/* Username Below Thumbnail */}
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10},
  
  statusBox: { alignItems: "center", marginRight: 10 },
  
  statusThumbnail: {
    width: screenWidth * 0.2, // Dynamic width based on screen size
    height: screenWidth * 0.35,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "green",
    position: "relative"
  },
  
  thumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
  
  profileContainer: {
    position: "absolute",
    top: 5,
    left: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000",
    overflow: "hidden"
  },
  
  profileImage: { width: 30, height: 30, borderRadius: 15 },
  
  name: { color: "white", marginTop: 5, fontSize: 12 }
});
