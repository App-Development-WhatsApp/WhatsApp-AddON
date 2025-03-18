import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function NotificationScreen({ navigation }) {
  const [conversationTones, setConversationTones] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [highPriorityNotifications, setHighPriorityNotifications] =
    useState(false);
  const [reactionNotifications, setReactionNotifications] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {/* General Notifications */}
      <View style={styles.section}>
        <SettingItem
          text="Conversation tones"
          subText="Play sounds for incoming and outgoing messages."
          switchEnabled={conversationTones}
          toggleSwitch={() => setConversationTones(!conversationTones)}
        />
        <SettingItem
          text="Reminders"
          subText="Get occasional reminders about messages or status updates you haven't seen"
          switchEnabled={reminders}
          toggleSwitch={() => setReminders(!reminders)}
        />
      </View>

      {/* Messages Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Messages</Text>
        <SettingItem text="Notification tone" subText="Default" />
        <SettingItem text="Vibrate" subText="Default" />
        <SettingItem text="Popup notification" subText="Not available" />
        <SettingItem text="Light" subText="White" />
        <SettingItem
          text="Use high priority notifications"
          subText="Show previews of notifications at the top of the screen"
          switchEnabled={highPriorityNotifications}
          toggleSwitch={() =>
            setHighPriorityNotifications(!highPriorityNotifications)
          }
        />
        <SettingItem
          text="Reaction notifications"
          subText="Show notifications for reactions to messages you send"
          switchEnabled={reactionNotifications}
          toggleSwitch={() =>
            setReactionNotifications(!reactionNotifications)
          }
        />
      </View>

      {/* Groups Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Groups</Text>
        <SettingItem text="Notification tone" subText="Default (Signal)" />
        <SettingItem text="Vibrate" subText="Default" />
        <SettingItem text="Light" subText="Red" />
        <SettingItem
          text="Use high priority notifications"
          subText="Show previews of notifications at the top of the screen"
          switchEnabled={highPriorityNotifications}
          toggleSwitch={() =>
            setHighPriorityNotifications(!highPriorityNotifications)
          }
        />
        <SettingItem
          text="Reaction notifications"
          subText="Show notifications for reactions to messages you send"
          switchEnabled={reactionNotifications}
          toggleSwitch={() =>
            setReactionNotifications(!reactionNotifications)
          }
        />
      </View>

      {/* Calls Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calls</Text>
        <SettingItem text="Ringtone" subText="Default (Galaxy Bells)" />
        <SettingItem text="Vibrate" subText="Default" />
      </View>

      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <SettingItem
          text="Reactions"
          subText="Show notifications when you get likes on your status"
          switchEnabled={reactionNotifications}
          toggleSwitch={() =>
            setReactionNotifications(!reactionNotifications)
          }
        />
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

