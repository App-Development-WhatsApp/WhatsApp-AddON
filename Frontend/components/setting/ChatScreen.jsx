import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';

export default function ChatScreen({ navigation }) {
  const [enterIsSend, setEnterIsSend] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(false);
  const [voiceTranscripts, setVoiceTranscripts] = useState(false);
  const [keepChatsArchived, setKeepChatsArchived] = useState(true);

  return (
    <ScrollView style={styles.container}>
        <View style={styles.titleBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Chats</Text>
        </View>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>
        <SettingItem text="Theme" subText="System default" />
        <SettingItem text="Default chat theme" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chat settings</Text>
        <SettingItem
          text="Enter is send"
          subText="Enter key will send your message"
          switchEnabled={enterIsSend}
          toggleSwitch={() => setEnterIsSend(!enterIsSend)}
        />
        <SettingItem
          text="Media visibility"
          subText="Show newly downloaded media in your device's gallery"
          switchEnabled={mediaVisibility}
          toggleSwitch={() => setMediaVisibility(!mediaVisibility)}
        />
        <SettingItem text="Font size" subText="Medium" />
        <SettingItem
          text="Voice message transcripts"
          subText="Read new voice messages."
          switchEnabled={voiceTranscripts}
          toggleSwitch={() => setVoiceTranscripts(!voiceTranscripts)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Archived chats</Text>
        <SettingItem
          text="Keep chats archived"
          subText="Archived chats will remain archived when you receive a new message"
          switchEnabled={keepChatsArchived}
          toggleSwitch={() => setKeepChatsArchived(!keepChatsArchived)}
        />
      </View>

      <View style={styles.section}>
        <SettingItem text="Chat backup" />
        <SettingItem text="Transfer chats" />
        <SettingItem text="Chat history" />
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
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  settingItem: {
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

