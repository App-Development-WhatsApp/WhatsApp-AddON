import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from "expo-file-system";
import { userFilePath, friendsFilePath } from '../../utils/chatStorage';
import { dropAllTables } from '../../database/resetTables';

export default function MenuBar() {

  
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  // Logout Function
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              const filesToDelete = [userFilePath, friendsFilePath];

              for (const file of filesToDelete) {
                const fileInfo = await FileSystem.getInfoAsync(file);
                if (fileInfo.exists) {
                  await FileSystem.deleteAsync(file);
                }
              }

              await dropAllTables();     // Clear all data
              navigation.replace("Login"); // Navigate to Login screen
            } catch (error) {
              console.error("Logout error:", error);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { label: "New Group" },
    { label: "New Broadcast" },
    { label: "Linked Devices" },
    { label: "Starred Messages" },
    { label: "Settings", action: () => navigation.navigate("Settings") },
    { label: "Logout", action: handleLogout } // 👈 Logout button
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.icon}>
        <Feather name="more-vertical" size={24} color="white" />
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index === menuItems.length - 1 && { borderBottomWidth: 0 }]} // No border on last item
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
  container: { position: "relative" },
  icon: { padding: 5 },
  overlay: { flex: 1, justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 50, paddingRight: 10 },
  menu: { backgroundColor: "#1F1F1F", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, elevation: 5, width: 180 },
  menuItem: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#333" },
  menuText: { color: "white", fontSize: 16 }
});
