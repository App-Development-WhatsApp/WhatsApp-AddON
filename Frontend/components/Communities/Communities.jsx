import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "react-native";

const fileUri = FileSystem.documentDirectory + "communities.json";

export default function Communities({ navigation, route }) {
  const [communities, setCommunities] = useState([]);

  // Read data from local JSON file
  const loadCommunities = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        setCommunities(JSON.parse(content));
      } else {
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify([]));
      }
    } catch (error) {
      console.error("Error loading communities:", error);
    }
  };

  // Save data to local JSON file
  const saveCommunities = async (newList) => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(newList));
    } catch (error) {
      console.error("Error saving communities:", error);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchCommunities = async () => {
        try {
          const fileUri = FileSystem.documentDirectory + "communities.json";
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
  
          if (fileInfo.exists) {
            const content = await FileSystem.readAsStringAsync(fileUri);
            const parsed = JSON.parse(content);
            setCommunities(parsed);
          } else {
            setCommunities([]);
          }
        } catch (error) {
          console.error("Error reading communities.json:", error);
        }
      };
  
      fetchCommunities();
    }, [])
  );
  

  const renderCommunity = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("CommunityScreen", {
      photo: item.photo || null,
      name: item.name,
      description: item.description || "Welcome to your community!"
    })}>
    <View style={styles.communityBox}>
      <View style={styles.communityHeader}>
        {item.photo ? (
          <Image
          source={{ uri: item.photo }}
          style={styles.communityImage}
          />
        ) : (
          <Ionicons name="people" size={32} color="white" style={styles.communityIcon} />
        )}
        <Text style={styles.communityTitle}>{item.name}</Text>
      </View>
      <View style={styles.messageBox}>
        <View style={styles.messageRow}>
          <MaterialIcons name="campaign" size={20} color="#00A884" />
          <Text style={styles.messageTitle}>Announcements</Text>
          <Text style={styles.time}>3:15 am</Text>
        </View>
        <Text style={styles.messageSubtitle}>Welcome to your community!</Text>
      </View>
      <View style={styles.messageBox}>
        <View style={styles.messageRow}>
          <MaterialIcons name="chat-bubble-outline" size={20} color="#ccc" />
          <Text style={styles.messageTitle}>General</Text>
          <Text style={styles.time}>3:15 am</Text>
        </View>
        <Text style={styles.messageSubtitle}>Welcome to the group: General</Text>
      </View>
      <Text style={styles.viewAll}> View all</Text>
    </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Communities</Text>
        <View style={styles.icons}>
          <MaterialIcons name="qr-code-scanner" size={24} color="white" style={styles.icon} />
          <MaterialIcons name="more-vert" size={24} color="white" style={styles.icon} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.newCommunity}
        onPress={() => navigation.navigate("CreateCommunity")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="people" size={24} color="white" />
          <View style={styles.addIcon}>
            <Ionicons name="add" size={16} color="white" />
          </View>
        </View>
        <Text style={styles.newCommunityText}>New community</Text>
      </TouchableOpacity>

      <FlatList
        data={communities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCommunity}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={{ color: "#888", textAlign: "center", marginTop: 50 }}>
              No communities yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { color: "white", fontSize: 24, fontWeight: "bold" },
  icons: { flexDirection: "row" },
  icon: { marginLeft: 16 },
  newCommunity: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  iconContainer: {
    position: "relative",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3E3E3E",
    justifyContent: "center",
    alignItems: "center",
  },
  addIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#00A884",
    borderRadius: 10,
    padding: 2,
  },
  newCommunityText: { color: "white", fontSize: 18, marginLeft: 16 },
  emptyContent: { flex: 1 },
  communityBox: {
    backgroundColor: "#1F1F1F",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  communityImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },  
  communityIcon: { marginRight: 12 },
  communityTitle: { color: "white", fontSize: 20, fontWeight: "600" },
  messageBox: { paddingLeft: 6, marginBottom: 8 },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageTitle: { color: "white", fontWeight: "bold", flex: 1, marginLeft: 8 },
  messageSubtitle: { color: "#ccc", marginLeft: 28 },
  time: { color: "#aaa", fontSize: 12 },
  viewAll: {
    color: "#00A884",
    fontWeight: "500",
    marginLeft: 6,
    marginTop: 4,
 },
});