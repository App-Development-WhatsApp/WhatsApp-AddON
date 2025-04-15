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
  saveChatMessage,
} from "../../utils/chatStorage";
import { loadChatHistory } from "../../utils/chatStorage";
import * as DocumentPicker from "expo-document-picker";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { renderMessage } from "./RenderMessages";
import SocketServices from "../../Services/SocketServices";
import { useNetInfo } from "@react-native-community/netinfo";
import OneTimeView from "./OneTimeView";
// import ThreeDots from "react-loader-spinner";

export default function Chatting() {
  const navigation = useNavigation();
  const netInfo = useNetInfo();
  const route = useRoute();
  const { userId: friendId, name, image } = route.params;
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [oneTimeView, setOneTimeView] = useState(false);
  const [typing, setTyping] = useState(false);
  const [inputBoxFocus, setinputBoxFocus] = useState(false);

  const [chats, setChats] = useState([]);

  useEffect(() => {
    const setup = async () => {
      try {
        const user = await loadUserInfo();
        setCurrentUserId(user._id);
        const chatsdata = await loadChatHistory(friendId);
        setChats(chatsdata);
      } catch (err) {
        console.error("Error loading user or chats:", err);
      }
    };
    setup();
  }, []);

  useEffect(() => {
    const messageListener = async (msg) => {
      const formatted = {
        ...msg,
        timestamp: Date.now().toString(), // overwrite existing timestamp
      };
      setChats((prev) => [...prev, formatted]);
      await saveChatMessage(formatted.senderId, formatted);
    };

    SocketServices.registerReceiveMessage(messageListener);
    return () => {
      SocketServices.unregisterReceiveMessage(messageListener);
    };
  }, [friendId, netInfo.isConnected, currentUserId, typing]);

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
        oneTimeView: oneTimeView,
      };
      console.log(newMsg)

      setChats((prev) => [...prev, { ...newMsg }]);
      SocketServices.sendMessage(newMsg);

      setMessage("");
      setSelectedFiles([]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
        multiple: true,
      });

      if (!result.canceled) {
        // Directly update the state with the newly selected files
        setSelectedFiles((prev) => {
          const updatedFiles = [...prev, ...result.assets];
          // console.log(updatedFiles); // Log the updated list here
          return updatedFiles;
        });
      }
    } catch (error) {
      console.error("Error selecting files", error);
    }
  };
  const handleOneTimeView = (messageId, file) => {
    setChats((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, files: [], text: "Message depricated" }
          : msg
      )
    );
    // deete message from chat list

    navigation.navigate("OneTimeViewer", {
      file,
      onViewed: () => {
        setChats((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, files: [], text: "Message depricated" }
              : msg
          )
        );
      },
    });
  };

  const renderFilePreview = (file) => {
    console.log(file);
    if (file.mimeType?.startsWith("image")) {
      return (
        <Image
          source={{ uri: file.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        // <Text style={{ color: 'white' }}>📷 {file.uri}</Text>
      );
    }
    if (file.mimeType?.startsWith("video")) {
      return (
        <Video
          source={{ uri: file.uri }}
          style={styles.previewImage}
          useNativeControls
          resizeMode="cover"
        />
      );
    }
    return <Text style={{ color: "white" }}>📎 {file.name}</Text>;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image
            source={
              image ? { uri: image } : require("../../assets/images/blank.jpeg")
            }
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.name}>{name}</Text>

            {typing && (
              <Text style={{ color: "white", fontSize: 12 }}>Typing...</Text>
            )}
          </View>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("AudioScreen", {
                callerId: currentUserId,
                friendId: friendId,
                friendName: name,
                Profile: image,
              });
            }}
          >
            <FontAwesome name="phone" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialCommunityIcons name="video" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearChat}>
            <Feather name="trash-2" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat list */}
      <KeyboardAvoidingView
        style={{ flex: inputBoxFocus ? 0.82 : 0.99, scrollToEnd: true }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.oneTimeView && item.files?.length === 1) {
              return (
                <TouchableOpacity
                  onPress={() => handleOneTimeView(item.id, item.files[0])}
                >
                  <View style={[styles.messageBubble, styles.theirMessage]}>
                    <Text style={styles.messageText}>One Time View</Text>
                  </View>
                </TouchableOpacity>
              );
            } else {
              return renderMessage({ item, currentUserId });
            }
          }}
          contentContainerStyle={styles.chatList}
        />
      </KeyboardAvoidingView>

      {/* Preview of Files */}
      {selectedFiles.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            padding: 2,
            backgroundColor: "#202c33",
            position: "absolute",
            bottom: showEmojiPicker ? 430 : 70,
            borderRadius: 12,
          }}
        >
          {selectedFiles.map((file, index) => (
            <View key={index} style={{ marginRight: 1 }}>
              {renderFilePreview(file)}
              <TouchableOpacity
                style={styles.removeIcon}
                onPress={() =>
                  setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="red"
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Input Container */}

      <View
        style={{ ...styles.inputContainer, bottom: showEmojiPicker ? 365 : 0 }}
      >
        <View style={styles.inputWrapper}>
          <TouchableOpacity
            style={styles.inputIconLeft}
            onPress={() => setShowEmojiPicker(true)}
          >
            <MaterialCommunityIcons
              name="emoticon-happy"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={message}
            onFocus={() => {
              setShowEmojiPicker(false)
              // console.log("hello")
              setinputBoxFocus(true)
            }}
            onBlur={() => {
              console.log("hello")
              setinputBoxFocus(false)
            }}
            onChangeText={(text) => setMessage(text)}
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
    backgroundColor: "#202c33",
    position: "absolute",
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
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 0,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  removeIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    borderRadius: 20,
    padding: 2,
    zIndex: 10,
  },
  chatList: {
    // height: "300%",
    overflow: "scroll",
    // backgroundColor: "red",
  },
});
