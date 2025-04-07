import React, { useEffect, useRef, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  MaterialCommunityIcons,
  FontAwesome,
  Entypo,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import EmojiPicker from "react-native-emoji-picker-staltz";
<<<<<<< HEAD
import {
  loadUserInfo,
  getSharedChatFilePath,
  readJsonFile,
  sendMessageSocket,
  socket,
  clearChatFile,
} from "../../utils/chatStorage";
=======
import { API_URL } from "../../Services/AuthServices";
import socket from '../../utils/socket'; // Adjust the import path as necessary

>>>>>>> 9c5f09fa28009fb38090c4efa25b7fb835508546

export default function Chatting() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId: friendId, name, image } = route.params;
  const [chats, setChats] = useState([]);
<<<<<<< HEAD
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef(null);
=======
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
>>>>>>> 9c5f09fa28009fb38090c4efa25b7fb835508546

  useEffect(() => {
    const setup = async () => {
      const user = await loadUserInfo();
      setCurrentUserId(user._id);
      await loadChatHistory(user._id);
    };

    setup();

    const messageListener = (msg) => {
      if (
        (msg.senderId === friendId && msg.receiverId === currentUserId) ||
        (msg.senderId === currentUserId && msg.receiverId === friendId)
      ) {
        const formatted = {
          ...msg,
          id: Date.now().toString(),
          sender: msg.senderId === currentUserId ? "me" : "them",
        };
        setChats((prev) => [...prev, formatted]);
      }
    };

    socket.on("receiveMessage", messageListener);

    return () => {
      socket.off("receiveMessage", messageListener);
    };
  }, [friendId, currentUserId]);

  const loadChatHistory = async (myId) => {
    const filePath = await getSharedChatFilePath(friendId);
    if (filePath) {
      const data = await readJsonFile(filePath);
      if (data && data.messages) {
        const formatted = data.messages.map((msg) => ({
          ...msg,
          sender: msg.senderId === myId ? "me" : "them",
        }));
        setChats(formatted);
      }
    }
  };

  const handleClearChat = async () => {
    Alert.alert("Clear Chat", "Are you sure you want to delete all messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        onPress: async () => {
          try {
            await clearChatFile(friendId);
            setChats([]);
          } catch (err) {
            console.error("Error clearing chat:", err);
          }
        },
      },
    ]);
  };

  const handleSend = async () => {
    if (!message.trim() || !currentUserId) return;

    const newMsg = {
      id: Date.now().toString(),
      text: message,
      sender: "me",
      senderId: currentUserId,
      receiverId: friendId,
      timestamp: new Date().toISOString(),
    };

    setChats((prev) => [...prev, newMsg]);
    await sendMessageSocket(friendId, message);
    setMessage("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image
            source={image ? { uri: image } : require("../../assets/images/blank.jpeg")}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity><FontAwesome name="phone" size={22} color="white" /></TouchableOpacity>
          <TouchableOpacity><MaterialCommunityIcons name="video" size={26} color="white" /></TouchableOpacity>
          <TouchableOpacity onPress={handleClearChat}>
            <Feather name="trash-2" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat list */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={chats}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === "me" ? styles.myMessage : styles.theirMessage]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </KeyboardAvoidingView>

      {/* Input */}
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
        </View>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <MaterialCommunityIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Emoji Picker */}
      <Modal visible={showEmojiPicker} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowEmojiPicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
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
  iconContainer: { flexDirection: "row", gap: 15, alignItems: "center" },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "75%",
    margin: 15,
  },
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
    paddingHorizontal: 40,
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
  inputIconLeft: { position: "absolute", left: 10 },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "rgb(95, 252, 123)",
    padding: 10,
    borderRadius: 20,
  },
  emojiPickerContainer: {
    backgroundColor: "white",
    padding: 20,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
