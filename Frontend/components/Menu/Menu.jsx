import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import SettingsScreen from '../setting/SettingsScreen'; // Import the Settings screen
import { useNavigation } from '@react-navigation/native'; // 👈 Import navigation

export default function MenuBar() {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);
  const navigation = useNavigation(); // 👈 Get navigation object



  // ✅ Define menuItems inside the function so it can access setShowSettings
  const menuItems = [
    { label: 'New Group' },
    { label: 'New Broadcast' },
    { label: 'Linked Devices' },
    { label: 'Starred Messages' },
    { label: 'Settings', action: () => navigation.navigate('Settings') }, // Open Settings
  ];

  return (
    <View style={styles.container}>
      {/* Three Dots Icon */}
      <TouchableOpacity onPress={toggleMenu} style={styles.icon}>
        <Feather name="more-vertical" size={24} color="white" />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  if (item.action) item.action();
                }}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  icon: {
    padding: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 10,
  },
  menu: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 5,
    width: 180,
  },
  menuItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  menuText: {
    color: 'white',
    fontSize: 16,
  },
});
