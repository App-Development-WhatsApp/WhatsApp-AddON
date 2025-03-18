import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AppLanguageScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { name: "English", code: "en" },
    { name: "हिन्दी", code: "hi" },
    { name: "मराठी", code: "mr" },
    { name: "ગુજરાતી", code: "gu" },
  ];

  useEffect(() => {
    // Load saved language on component mount
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const storedLang = await AsyncStorage.getItem("appLanguage");
    if (storedLang) {
      setSelectedLanguage(storedLang);
    }
  };

  const changeLanguage = async (name) => {
    await AsyncStorage.setItem("appLanguage", name);
    setSelectedLanguage(name);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Language</Text>
      </View>

      {/* Language Setting */}
      <View style={styles.settingsList}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <SettingItem text="App language" subText={selectedLanguage} />
        </TouchableOpacity>
      </View>

      {/* Modal for Language Selection */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select App Language</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <ScrollView>
              {languages.map((lang, index) => (
                <TouchableOpacity key={index} style={styles.languageItem} onPress={() => changeLanguage(lang.name)}>
                  <Text style={styles.languageText}>{lang.name}</Text>
                  {selectedLanguage === lang.name && <Ionicons name="checkmark-circle" size={20} color="#0F9D58" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ✅ Reusable Setting Item Component
const SettingItem = ({ text, subText }) => (
  <View style={styles.settingItem}>
    <Text style={styles.settingText}>{text}</Text>
    <Text style={styles.settingSubText}>{subText}</Text>
  </View>
);

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#1C1C1C" },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
  settingsList: { marginTop: 10, paddingHorizontal: 15 },
  settingItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15 },
  settingText: { fontSize: 16, color: "white" },
  settingSubText: { fontSize: 13, color: "#888" },
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#1C1C1C", paddingBottom: 20, borderTopLeftRadius: 15 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 15 },
  modalTitle: { fontSize: 18, color: "white", fontWeight: "bold" },
  languageItem: { flexDirection: "row", justifyContent: "space-between", padding: 15 },
  languageText: { fontSize: 16, color: "white" },
});

