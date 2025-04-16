import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CommunityScreen({ route, navigation }) {
  const { name, photo, description } = route.params;

  const groups = [
    {
      id: "1",
      name: "A2",
      subtitle: "This group was added to the community...",
      date: "07/02/25",
    },
    {
      id: "2",
      name: "A1",
      subtitle: "This group was added to the community...",
      date: "07/02/25",
    },
    {
      id: "3",
      name: "General",
      subtitle: "You created this group",
      date: "03/02/25",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.iconBox}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} />
          ) : (
            <Ionicons name="people" size={50} color="white" />
          )}
        </View>
        <View>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>Community · 4 groups</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Groups you're in</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupRow}>
            <View style={styles.groupIcon}>
              <Ionicons name="people" size={30} color="white" />
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.groupDate}>{item.date}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 90 }}
      />

      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.addButtonText}>Add group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  iconBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#2e2e2e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  image: { width: 60, height: 60, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  subtitle: { fontSize: 14, color: "#aaa", marginTop: 2 },
  sectionTitle: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 30,
    marginBottom: 10,
    marginLeft: 20,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomColor: "#2a2a2a",
    borderBottomWidth: 1,
  },
  groupIcon: {
    backgroundColor: "#2e2e2e",
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 16, color: "white", fontWeight: "bold" },
  groupSubtitle: { fontSize: 13, color: "#aaa", marginTop: 2 },
  groupDate: { fontSize: 12, color: "#888", marginLeft: 10 },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#25D366",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
