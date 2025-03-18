import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5, Ionicons, Entypo } from '@expo/vector-icons';

// ✅ Accept navigation as a prop
export default function SettingsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <TouchableOpacity style={styles.profileSection}>
        <Image 
          source={{ uri: 'https://your-profile-image-url.com' }} 
          style={styles.profileImage} 
        />
        <View style={styles.profileText}>
          <Text style={styles.profileName}>Sahil Dhillon</Text>
          <Text style={styles.profileStatus}>As You Know More, You G...</Text>
        </View>
        <Feather name="plus-circle" size={24} color="green" />
      </TouchableOpacity>

      {/* Settings Options */}
      <View style={styles.settingsList}>
        <SettingsItem icon={<Feather name="key" size={22} color="white" />} text="Account" subText="Security notifications, change number" />
        <SettingsItem icon={<FontAwesome5 name="lock" size={22} color="white" />} text="Privacy" subText="Block contacts, disappearing messages" />
        <SettingsItem icon={<MaterialIcons name="emoji-emotions" size={22} color="white" />} text="Avatar" subText="Create, edit, profile photo" />
        <SettingsItem icon={<MaterialIcons name="format-list-bulleted" size={22} color="white" />} text="Lists" subText="Manage people and groups" />
        <SettingsItem icon={<MaterialIcons name="chat" size={22} color="white" />} text="Chats" subText="Theme, wallpapers, chat history" />
        
        {/* ✅ Navigate to Status Screen */}
        <SettingsItem 
          icon={<MaterialIcons name="storage" size={22} color="white" />} 
          text="Status" 
          subText="Status history" 
          onPress={() => navigation.navigate('Status')} 
        />

        <SettingsItem icon={<Ionicons name="notifications-outline" size={22} color="white" />} text="Notifications" subText="Message, group & call tones" />
        <SettingsItem icon={<MaterialIcons name="storage" size={22} color="white" />} text="Storage and data" subText="Network usage, auto-download" />
        <SettingsItem icon={<Entypo name="globe" size={22} color="white" />} text="App language" subText="English (device's language)" />
      </View>
    </ScrollView>
  );
}

// ✅ Update SettingsItem to support navigation
const SettingsItem = ({ icon, text, subText, onPress }) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    {icon}
    <View style={styles.textContainer}>
      <Text style={styles.settingText}>{text}</Text>
      <Text style={styles.settingSubText}>{subText}</Text>
    </View>
  </TouchableOpacity>
);


// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark theme
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  profileStatus: {
    fontSize: 14,
    color: '#888',
  },
  settingsList: {
    marginTop: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  textContainer: {
    marginLeft: 15,
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
