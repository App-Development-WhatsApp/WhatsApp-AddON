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
import {
  loadUserInfo,
  getSharedChatFilePath,
  readJsonFile,
  sendMessageSocket,
  socket,
  clearChatFile,
} from "../../utils/chatStorage";
import { loadChatHistory } from "../../utils/chatStorage";
import * as DocumentPicker from "expo-document-picker";
import { Video } from "expo-av";
import * as ImagePicker from 'expo-image-picker';

export default function Chatting() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId: friendId, name, image, roomId } = route.params;
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [oneTimeView, setOneTimeView] = useState(false);


  useEffect(() => {
    const setup = async () => {
      try {
        const user = await loadUserInfo();
        setCurrentUserId(user._id);
        const chatsdata = await loadChatHistory(roomId);
        // console.log(chatsdata)
        setChats(chatsdata);
      } catch (err) {
        console.error("Error loading user or chats:", err);
      }
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

  const handleSend = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      const newMsg = {
        id: Date.now().toString(),
        senderId: currentUserId,
        receiverId: friendId,
        timestamp: new Date().toISOString(),
        ...(message.trim() && { text: message.trim() }),
        ...(selectedFiles.length > 0 && { files: selectedFiles }),
      };
      console.log(newMsg)

      // setChats((prev) => [...prev, { ...newMsg, sender: currentUserId }]);
      // await sendMessageSocket(roomId, friendId, newMsg);

      // setMessage("");
      // setSelectedFiles([]);
      // setTimeout(() => {
      //   flatListRef.current?.scrollToEnd({ animated: true });
      // }, 100);
    } catch (err) {
      console.error("Error sending message:", err);
      Alert.alert("Failed", "Unable to send message. Please try again.");
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

  const pickFiles = async () => {
    setSelectedFiles([]); // Clears previous selected files
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Supports both images and videos
        multiple: true
      });

      if (!result.canceled) {
        // Directly update the state with the newly selected files
        setSelectedFiles((prev) => {
          const updatedFiles = [...prev, ...result.assets];
          // console.log(updatedFiles); // Log the updated list here
          return updatedFiles;
        });
        // handleSend();
      }
    } catch (error) {
      console.error("Error selecting files", error);
    }
  };


  const renderFilePreview = (file) => {
    if (file.mimeType?.startsWith('image')) {
      return <Image source={{ uri: file.uri }} style={styles.previewImage} />;
    }
    if (file.mimeType?.startsWith('video')) {
      return (
        <Video
          source={{ uri: file.uri }}
          style={styles.previewImage}
          useNativeControls
          resizeMode="cover"
        />
      );
    }
    return <Text style={{ color: 'white' }}>📎 {file.name}</Text>;
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
            <View style={[styles.messageBubble, item.senderId === currentUserId ? styles.myMessage : styles.theirMessage]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </KeyboardAvoidingView>

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
          <TouchableOpacity onPress={pickFiles} style={styles.attachButton}>
            <Text style={{ fontSize: 18 }}>📎</Text>
          </TouchableOpacity>
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
    // height: 200,
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
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
