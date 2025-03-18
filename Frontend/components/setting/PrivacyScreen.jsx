import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';

// Privacy screen component
export default function PrivacyScreen({ navigation }) {
  const [readReceipts, setReadReceipts] = React.useState(true);
  const toggleReadReceipts = () => setReadReceipts(!readReceipts);

  return (
    <View style={styles.container}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who can see my personal info</Text>
          <SettingsItem text="Last seen and online" subText="107 contacts excluded" />
          <SettingsItem text="Profile photo" subText="My contacts" />
          <SettingsItem text="About" subText="Everyone" />
          <SettingsItem text="Status" subText="16 contacts excluded" />
        </View>

        <View style={styles.section}>
          <SettingsItem 
            text="Read receipts" 
            subText="If turned off, you won’t send or receive Read receipts. Read receipts are always sent for group chats."
            switchEnabled={readReceipts}
            toggleSwitch={toggleReadReceipts}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disappearing messages</Text>
          <SettingsItem text="Default message timer" subText="Start new chats with disappearing messages set to your timer   Off" />
        </View>

        <View style={styles.section}>
          <SettingsItem text="Groups" subText="Everyone" />
          <SettingsItem text="Live location" />
          <SettingsItem text="Calls" subText="Silence unknown callers" />
          <SettingsItem text="Blocked contacts" subText="4" />
          <SettingsItem text="App lock" subText="Disabled" />
          <SettingsItem text="Chat lock" />
        </View>

        <View style={styles.section}>
          <SettingsItem 
            text="Allow camera effects" 
            subText="Use effects in the camera and video calls."
            switchEnabled={false} // Initially disabled
          />
        </View>

        <View style={styles.section}>
          <SettingsItem text="Advanced" subText="Protect IP address in calls, Disable link previews" />
          <SettingsItem text="Privacy checkup" subText="Control your privacy and choose the right settings for you." />
        </View>
      </ScrollView>
    </View>
  );
}

// Reusable Settings Item Component
const SettingsItem = ({ text, subText, switchEnabled, toggleSwitch }) => (
  <View style={styles.settingsItem}>
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
    backgroundColor: '#121212',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#1C1C1C',
  },
  backButton: {
    paddingRight: 15,
  },
  backText: {
    fontSize: 30,
    color: 'white',
  },
  title: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    paddingHorizontal: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  textContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: 'white',
  },
  settingSubText: {
    fontSize: 13,
    color: '#888',
  },
});
