import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

export default function AccountScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
        <View style={styles.titleBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Account</Text>
        </View>

      {/* Account Options */}
      <View style={styles.settingsList}>
        <SettingsItem icon={<MaterialIcons name="security" size={22} color="white" />} text="Security notifications" />
        <SettingsItem icon={<FontAwesome5 name="key" size={22} color="white" />} text="Passkeys" />
        <SettingsItem icon={<MaterialIcons name="email" size={22} color="white" />} text="Email address" />
        <SettingsItem icon={<MaterialIcons name="verified-user" size={22} color="white" />} text="Two-step verification" />
        <SettingsItem icon={<Ionicons name="call" size={22} color="white" />} text="Change number" />
        <SettingsItem icon={<Feather name="file-text" size={22} color="white" />} text="Request account info" />
        <SettingsItem icon={<FontAwesome5 name="user-plus" size={22} color="white" />} text="Add account" />
        <SettingsItem icon={<MaterialIcons name="delete" size={22} color="white" />} text="Delete account" />
      </View>
    </ScrollView>
  );
}

// ✅ Reusable SettingsItem Component
const SettingsItem = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    {icon}
    <Text style={styles.settingText}>{text}</Text>
  </TouchableOpacity>
);

// ✅ Styles
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
  settingsList: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  settingText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 15,
  },
});

