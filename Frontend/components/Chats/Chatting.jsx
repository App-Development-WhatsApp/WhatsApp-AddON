import React, { useEffect, useState } from "react";
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
import { MaterialCommunityIcons, FontAwesome, Entypo, Ionicons } from "@expo/vector-icons";
import EmojiPicker from "react-native-emoji-picker-staltz";
import { API_URL } from "../../Services/AuthServices";
import socket from '../../utils/socket'; // Adjust the import path as necessary


export default function Chatting() {
  const route = useRoute();
  const { name, image, id } = route.params;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  useEffect(()=>{
    console.log("Socket connected")
    socket.connect();
    socket.on("message", (data) => {
      setReceivedMessage(data);
    });

    return () => {
      socket.disconnect();
    };

  },[])

  const messages = [
    { id: "1", text: "Hey! How are you?", sender: "me" },
    { id: "2", text: "I am good! What about you?", sender: "them" },
    { id: "3", text: "I am fine too. What are you doing?", sender: "me" },
    { id: "4", text: "Just working on a project.", sender: "them" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image source={image} style={styles.profileImage} />
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity>
            <FontAwesome name="phone" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons name="video" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Entypo name="dots-three-vertical" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
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

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.inputIconLeft} onPress={() => setShowEmojiPicker(true)}>
            <MaterialCommunityIcons name="emoticon-happy" size={24} color="white" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.inputIconRight}>
            <MaterialCommunityIcons name="attachment" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sendButton}>
          <MaterialCommunityIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>


      {/* Emoji Picker */}
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
  container: { flex: 1, backgroundColor: "#0b141a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#202c33",
  },
  backButton: { marginRight: 10 },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { fontSize: 18, color: "white" },
  iconContainer: { flexDirection: "row", gap: 15, alignItems: "center"},
  messagesContainer: { flex: 1, padding: 10 },
  messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: "75%" },
  myMessage: { alignSelf: "flex-end", backgroundColor: "#005c4b" },
  theirMessage: { alignSelf: "flex-start", backgroundColor: "#202c33" },
  messageText: { color: "white" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#1f3b3e",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#233040",
    paddingHorizontal: 40, // Space for icons
    borderRadius: 20,
    position: "relative",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: "white",
    fontSize: 16,
  },
  inputIconLeft: {
    position: "absolute",
    left: 10,
  },
  inputIconRight: {
    position: "absolute",
    right: 10,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "rgb(95, 252, 123)",
    padding: 10,
    borderRadius: 20,
  },
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