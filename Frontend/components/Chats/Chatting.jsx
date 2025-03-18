import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  Modal,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import EmojiPicker from "react-native-emoji-picker-staltz"; // ✅ Updated import

export default function Chatting() {
  const route = useRoute();
  const { name, image } = route.params;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");

  const messages = [
    { id: "1", text: "Hey! How are you?", sender: "me" },
    { id: "2", text: "I am good! What about you?", sender: "them" },
    { id: "3", text: "I am fine too. What are you doing?", sender: "me" },
    { id: "4", text: "Just working on a project.", sender: "them" },
  ];

  return (
    <View style={styles.container}>
      {/* 🔹 Chat Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={image} style={styles.profileImage} />
          <Text style={styles.name}>{name}</Text>
        </View>

        {/* Icons for Call, Video, and Menu */}
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.icon}>
            <FontAwesome name="phone" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <MaterialCommunityIcons name="video" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <Entypo name="dots-three-vertical" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === "me" ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          style={styles.messagesContainer}
        />
      </KeyboardAvoidingView>

      {/* 🔹 Input Bar */}
      <View style={styles.inputContainer}>
        {/* Emoji Button */}
        <TouchableOpacity onPress={() => setShowEmojiPicker(true)}>
          <MaterialCommunityIcons name="emoticon-happy" size={24} color="white" />
        </TouchableOpacity>

        {/* Input Box with Camera & File Inside */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
          />

          {/* Camera Icon */}
          <TouchableOpacity style={styles.inputIcon}>
            <MaterialCommunityIcons name="camera" size={24} color="white" />
          </TouchableOpacity>

          {/* File Attachment Icon */}
          <TouchableOpacity style={styles.inputIcon}>
            <MaterialCommunityIcons name="attachment" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton}>
          <MaterialCommunityIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 🔹 Emoji Picker Modal */}
      <Modal visible={showEmojiPicker} transparent={true} animationType="slide">
        <View style={styles.emojiPickerContainer}>
          <EmojiPicker
            onEmojiSelected={(emoji) => {
              setMessage((prev) => prev + emoji);
              setShowEmojiPicker(false);
            }}
            enableSearch
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#011513", padding: 10 },

  // 🔹 Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f3b3e",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  name: { fontSize: 20, fontWeight: "bold", color: "white" },
  iconContainer: { flexDirection: "row", gap: 15 },
  icon: { padding: 5 },

  // 🔹 Messages
  messagesContainer: { flex: 1, marginTop: 10 },
  messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: "70%" },
  myMessage: { alignSelf: "flex-end", backgroundColor: "rgb(95, 252, 123)" },
  theirMessage: { alignSelf: "flex-start", backgroundColor: "#1f3b3e" },
  messageText: { color: "white", fontSize: 16 },

  // 🔹 Input Bar
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#1f3b3e",
  },

  // ✅ Input with Camera & File Icons Inside
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#233040",
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  input: { flex: 1, padding: 10, color: "white", maxHeight: 40 },
  inputIcon: { marginLeft: 10 },

  // ✅ Send Button
  sendButton: {
    marginLeft: 10,
    backgroundColor: "rgb(95, 252, 123)",
    padding: 10,
    borderRadius: 20,
  },

  // ✅ Emoji Picker Modal
  emojiPickerContainer: {
    backgroundColor: "white",
    padding: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
