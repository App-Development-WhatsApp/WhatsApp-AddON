import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppUpdateScreen({ navigation }) {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [allowAnyNetwork, setAllowAnyNetwork] = useState(false);
  const [updateNotification, setUpdateNotification] = useState(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App update settings</Text>
      </View>

      {/* App Updates Section */}
      <Text style={styles.sectionTitle}>App updates</Text>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingTitle}>Auto-update WhatsApp</Text>
          <Text style={styles.settingSubtitle}>Automatically download app updates.</Text>
        </View>
        <Switch value={autoUpdate} onValueChange={setAutoUpdate} />
      </View>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingTitle}>Allow updates over any network</Text>
          <Text style={styles.settingSubtitle}>
            Download updates using mobile data when Wi-Fi is not available. Data charges may apply.
          </Text>
        </View>
        <Switch value={allowAnyNetwork} onValueChange={setAllowAnyNetwork} />
      </View>

      {/* Notifications Section */}
      <Text style={styles.sectionTitle}>Notifications</Text>

      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingTitle}>WhatsApp update available</Text>
          <Text style={styles.settingSubtitle}>Get notified when updates are available.</Text>
        </View>
        <Switch value={updateNotification} onValueChange={setUpdateNotification} />
      </View>
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#555",
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDD",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
    maxWidth: "90%",
  },
});

