import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
      </View>

      {/* Help Options */}
      <View style={styles.optionsContainer}>
        <HelpItem icon="help-circle-outline" text="Help Centre" subText="Get help, contact us" />
        <HelpItem icon="document-text-outline" text="Terms and Privacy Policy" />
        <HelpItem icon="alert-circle-outline" text="Channel reports" />
        <HelpItem icon="information-circle-outline" text="App info" />
      </View>
    </View>
  );
}

// ✅ Reusable Help Item Component
const HelpItem = ({ icon, text, subText }) => (
  <TouchableOpacity style={styles.item}>
    <Ionicons name={icon} size={22} color="white" style={styles.icon} />
    <View style={styles.textContainer}>
      <Text style={styles.itemText}>{text}</Text>
      {subText && <Text style={styles.itemSubText}>{subText}</Text>}
    </View>
  </TouchableOpacity>
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
    padding: 15,
    backgroundColor: "#1C1C1C",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  optionsContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: "white",
  },
  itemSubText: {
    fontSize: 13,
    color: "#888",
  },
});

