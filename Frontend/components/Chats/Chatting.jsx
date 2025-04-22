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
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import EmojiPicker from "react-native-emoji-picker-staltz";
import {
  loadUserInfo,
  clearChatFile,
  saveChatMessage,
  deprecateOneTimeMessageInFile,
} from "../../utils/chatStorage";
import { loadChatHistory } from "../../utils/chatStorage";
// import * as DocumentPicker from "expo-document-picker";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { renderMessage } from "./RenderMessages";
import { useNetInfo } from "@react-native-community/netinfo";
// import OneTimeView from "./OneTimeView";
import { useSocket } from "../../context/SocketContext";
import { addFriends, getAllChatsSorted, getChatById, UpdateChatById } from "../../database/curd";
import * as FileSystem from 'expo-file-system';
import { downloadToLocal } from "../../utils/FileHandling";
import { sendFiles } from "../../utils/AuthServices";


export default function Chatting() {
  const navigation = useNavigation();
  const {
    sendMessage,
    registerReceiveMessage,
    unregisterReceiveMessage
  } = useSocket();
  const netInfo = useNetInfo();
  const route = useRoute();
  const { userId: userId, name, image } = route.params;
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [oneTimeView, setOneTimeView] = useState(false);
  const [inputBoxFocus, setinputBoxFocus] = useState(false);

  const [chats, setChats] = useState([]);
  useEffect(() => {
    // console.log(route.params, "params------------------");
    const setup = async () => {
      try {
        const user = await loadUserInfo();
        setCurrentUserId(user.id);
        setUser(user)
        // console.log(userId, "friendId------------------");
        // console.log(currentUserId, "MyId------------------");
        const chatsdata = await loadChatHistory(userId);
        setChats(chatsdata);
        // console.log(chatsdata, "chatsdata------------------");
      } catch (err) {
        // console.error("Error loading user or chats:", err);
      }
    };
    setup();
  }, []);


  useEffect(() => {
    const messageListener = async (msg) => {
      let formatted = {
        ...msg,
        timestamp: Date.now().toString()
      };
      // console.log("message->",formatted)

      // If files are present and not one-time-view
      if (msg.files?.length > 0 && !msg.oneTimeView) {
        const localFiles = await Promise.all(
          msg.files.map(async (file) => {
            const uri = await downloadToLocal(file.url, file.name);
            return {
              ...file,
              uri, // Attach local URI
            };
          })
        );

        formatted = {
          ...formatted,
          files: localFiles,
          Loading: false,
          send: true,
        };
      }
      if (formatted.senderId === userId) {
        setChats((prev) => [...prev, formatted]);
      }
      const existingChat = await getChatById(msg.senderId);
      if (!existingChat) {
        await addFriends({
          _id: msg.senderId,
          profilePic: msg.profilePic || "",
          description: "",
          name: msg.name,
          lastMessage: message,
          Unseen: 0,
          isGroup: 0,
          Ids: [userId],
        });
      }
      if (msg.text.trim() !== "") {
        await UpdateChatById(userId, msg.text.trim());
      }
      await saveChatMessage(formatted.senderId, formatted);
    };

    registerReceiveMessage(messageListener);
    return () => unregisterReceiveMessage(messageListener);
  }, [netInfo.isConnected]);


  const handleSend = async () => {
    console.log(name, image, "name,image", currentUserId)
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      const existingChat = await getChatById(userId);
      if (!existingChat) {
        await addFriends({
          _id: userId,
          profilePic: image,
          description: "",
          name,
          lastMessage: message,
          Unseen: 0,
          isGroup: 0,
          Ids: [userId],
        });
      }

      const tempMsgId = Date.now().toString();
      const newMsg = {
        id: tempMsgId,
        senderId: currentUserId,
        receiverId: userId,
        Loading: selectedFiles.length > 0 ? true : false,
        send: selectedFiles.length > 0 ? false : true,
        name: name,
        profilePic: image,
        timestamp: new Date().toISOString(),
        ...(message.trim() && { text: message.trim() }),
        ...(selectedFiles.length > 0 && { files: selectedFiles }),
        oneTimeView,
      };

      setChats((prev) => [...prev, newMsg]);
      setMessage("");
      setSelectedFiles([]);
      setOneTimeView(false);

      if (selectedFiles.length > 0) {
        const result = await sendFiles(selectedFiles);
        // console.log(result, "result");

        let updatedMsg = { ...newMsg };

        if (result.success && Array.isArray(result.response)) {
          const files = result.response.map(link => {
            const fileName = decodeURIComponent(link.split("/").pop());
            const cleanedName = fileName.replace(/(\.[^/.]+)(?=\.)/, ""); // removes extra middle extension
            const extension = cleanedName.split(".").pop().toLowerCase();

            let mimeType = "application/octet-stream";
            if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
              mimeType = `image/${extension === "jpg" ? "jpeg" : extension}`;
            } else if (["mp4", "mov", "avi", "webm"].includes(extension)) {
              mimeType = `video/${extension}`;
            } else if (["mp3", "wav", "aac"].includes(extension)) {
              mimeType = `audio/${extension}`;
            } else if (extension === "pdf") {
              mimeType = "application/pdf";
            }

            return {
              url: link,
              mimeType,
              name: cleanedName,
            };
          });

          updatedMsg.files = files;
        }

        if (result.success) {
          // console.log("Sending message:", updatedMsg);
          setChats((prev) =>
            prev.map((msg) =>
              msg.id === tempMsgId ? { ...updatedMsg, Loading: false, send: true } : msg
            )
          );
          await sendMessage(updatedMsg);
        } else {
          setChats((prev) =>
            prev.map((msg) =>
              msg.id === tempMsgId ? { ...msg, Loading: false, send: false } : msg
            )
          );
        }
        await saveChatMessage(updatedMsg.receiverId, updatedMsg);
        // console.log("cahats", chats)
      } else {
        await sendMessage(newMsg);
        await saveChatMessage(newMsg.receiverId, newMsg);
        await UpdateChatById(userId, newMsg.text);
      }
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
            await clearChatFile(userId);
            setChats([]);
          } catch (err) {
            // console.error("Error clearing chat:", err);
          }
        },
      },
    ]);
  };

  const pickFiles = async () => {
    // setSelectedFiles([]); // Clears previous selected files
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Supports both images and videos
        multiple: true,
      });

      if (!result.canceled) {
        // Directly update the state with the newly selected files
        setSelectedFiles((prev) => {
          const newFiles = result.assets.filter(
            newFile => !prev.some(file => file.uri === newFile.uri)
          );
          return [...prev, ...newFiles];
        });

      }
    } catch (error) {
      // console.error("Error selecting files", error);
    }
  };
  const handleOneTimeView = async (messageId, file, text) => {
    console.log("One Time View clicked", messageId, file, text);
    setChats((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, files: [], text: "Message depricated", oneTimeView: false }
          : msg
      )
    );
    // deete message from chat list
    await deprecateOneTimeMessageInFile(messageId);

    navigation.navigate("OneTimeViewer", {
      file, text
    });
  };

  const renderFilePreview = (file) => {
    // console.log(file);
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
          onPress={() => navigation.replace("Main")}
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
          </View>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("AudioScreen",
                {
                  callerId: currentUserId,
                  friendId: userId,
                  type: "outgoingcall",
                  mode: "voice",
                  friendName: name,
                  callerName: user.fullName,
                  callerProfile: user.profilePic,
                  friendProfile: image,
                }
              );
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
          nestedScrollEnabled={true}
          ref={flatListRef}
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            if (item.oneTimeView && item.files?.length === 1) {
              return (
                <TouchableOpacity
                  key={index}
                  disabled={!item.oneTimeView}
                  onPress={() =>
                    handleOneTimeView(
                      item.id,
                      item.files[0], // passing the file
                      item.text     // optional text if needed
                    )
                  }
                >
                  <View style={[styles.messageBubble, item.senderId == currentUserId ? styles.myMessage : styles.theirMessage]}>
                    <Text> <Image
                      style={[
                        styles.image,
                        oneTimeView ? { backgroundColor: 'white', borderRadius: 50 } : { borderRadius: 50 }
                      ]}
                      source={require('../../assets/icons/onetime.png')}
                      borderRadius={50}
                      resizeMode="cover"
                    /> One Time View</Text>
                  </View>
                </TouchableOpacity>
              );
            } else {
              return renderMessage(item, currentUserId, index, navigation); // Fallback to normal render
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
              setinputBoxFocus(true)
            }}
            onBlur={() => {
              setinputBoxFocus(false)
            }}
            onChangeText={(text) => setMessage(text)}
          />
          {selectedFiles.length > 0 && (
            <TouchableOpacity onPress={() => {
              setOneTimeView(!oneTimeView)
              // console.log(oneTimeView)
            }}>
              <Image
                style={[
                  styles.image,
                  oneTimeView ? { backgroundColor: 'white', borderRadius: 50 } : { borderRadius: 50 }
                ]}
                source={require('../../assets/icons/onetime.png')}
                borderRadius={50}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

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
  attachButton: {
    position: "absolute",
    right: 12
  },
  image: {
    height: 25,
    width: 25,
  },
  messageBubble: {
    padding: 8,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "75%",
    margin: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#005c4b"
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#202c33"
  },
});
