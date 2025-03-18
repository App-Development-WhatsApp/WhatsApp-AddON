import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function StorageAndDataScreen({ navigation }) {
  const [useLessData, setUseLessData] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Storage and Data</Text>
      </View>

      {/* Manage Storage */}
      <View style={styles.section}>
        <SettingItem text="Manage storage" subText="1.8 GB" />
      </View>

      {/* Network Usage & Data Settings */}
      <View style={styles.section}>
        <SettingItem
          text="Network usage"
          subText="646.3 MB sent • 3.3 GB received"
        />
        <SettingItem
          text="Use less data for calls"
          switchEnabled={useLessData}
          toggleSwitch={() => setUseLessData(!useLessData)}
        />
        <SettingItem text="Proxy" subText="Off" />
      </View>

      {/* Media Upload Quality */}
      <View style={styles.section}>
        <SettingItem text="Media upload quality" subText="Standard quality" />
      </View>

      {/* Media Auto-Download */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Media auto-download</Text>
        <Text style={styles.sectionSubtitle}>
          Voice messages are always automatically downloaded
        </Text>
        <SettingItem text="When using mobile data" subText="Photos" />
        <SettingItem text="When connected on Wi-Fi" subText="All media" />
        <SettingItem text="When roaming" subText="No media" />
      </View>
    </ScrollView>
  );
}

// Reusable Setting Item Component
const SettingItem = ({ text, subText, switchEnabled, toggleSwitch }) => (
  <View style={styles.settingItem}>
    <View style={styles.textContainer}>
      <Text style={styles.settingText}>{text}</Text>
      {subText && <Text style={styles.settingSubText}>{subText}</Text>}
    </View>
    {toggleSwitch !== undefined ? (
      <Switch value={switchEnabled} onValueChange={toggleSwitch} />
    ) : null}
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#1C1C1C",
  },
  backButton: {
    paddingRight: 15,
  },
  backText: {
    fontSize: 30,
    color: "white",
  },
  title: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  textContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: "white",
  },
  settingSubText: {
    fontSize: 13,
    color: "#888",
  },
});
