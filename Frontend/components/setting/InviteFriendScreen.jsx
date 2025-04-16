import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { contacts } from "../../lib/data"; // Import demo contacts

export default function InviteFriendScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite a friend</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Share Link */}
      <TouchableOpacity style={styles.shareLink}>
        <Ionicons name="share-social-outline" size={24} color="white" />
        <Text style={styles.shareText}>Share link</Text>
      </TouchableOpacity>

      {/* Contact List */}
      <Text style={styles.sectionTitle}>From Contacts</Text>
      <FlatList
      nestedScrollEnabled={true}
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item,index }) => <ContactItem key={index} name={item.name} phone={item.phone} />}
      />
    </View>
  );
}

// ✅ Contact Item Component
const ContactItem = ({ name, phone }) => (
  <View style={styles.contactItem}>
    <Ionicons name="person-circle-outline" size={40} color="#aaa" />
    <View style={styles.contactTextContainer}>
      <Text style={styles.contactName}>{name}</Text>
      <Text style={styles.contactPhone}>{phone}</Text>
    </View>
    <TouchableOpacity>
      <Text style={styles.inviteText}>Invite</Text>
    </TouchableOpacity>
  </View>
);

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#1C1C1C",
  },
  backButton: {
    paddingRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  shareLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    padding: 15,
    marginVertical: 10,
  },
  shareText: {
    fontSize: 16,
    color: "white",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#888",
    paddingHorizontal: 15,
    marginTop: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  contactName: {
    fontSize: 16,
    color: "white",
  },
  contactPhone: {
    fontSize: 13,
    color: "#888",
  },
  inviteText: {
    fontSize: 16,
    color: "#0F9D58",
    fontWeight: "bold",
  },
});
