import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSocket } from "../../context/SocketContext";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { addCallingEntryToChat, loadUserInfo } from "../../utils/chatStorage";

const IncomingCallBanner = () => {
  const { incomingCall, RegistercalcelCall, setIncomingCall, cancelCalling, AcceptCall } = useSocket();
  const navigation = useNavigation();

  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringtone = useRef(null);
  const autoDismissTimer = useRef(null);

  useEffect(() => {
    if (incomingCall) {

      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.WARNING);

      // Play ringtone
      playRingtone();

      // Auto-dismiss after 30 seconds
      autoDismissTimer.current = setTimeout(() => {
        stopRingtone();
        setIncomingCall(null);
      }, 30000);
    }

    return () => {
      stopRingtone();
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };

  }, [incomingCall]);

  const playRingtone = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/ringtone.mp3") // make sure this path is correct
      );
      ringtone.current = sound;
      await ringtone.current.setIsLoopingAsync(true);
      await ringtone.current.playAsync();
    } catch (err) {
      console.error("Error playing ringtone:", err);
    }
  };

  const stopRingtone = async () => {
    if (ringtone.current) {
      await ringtone.current.stopAsync();
      await ringtone.current.unloadAsync();
      ringtone.current = null;
    }
  };
  // { "callerId": "68052a005fc1272b32ee8cbf",
  //    "callerName": "Shivam",
  //     "callerProfile": "https://res.cloudinary.com/degeiws8x/image/upload/v1745168947/users/68052a005fc1272b32ee8cbf/profilePic.jpg",\
  //      "friendId": "6804d6e292f4071bf903886a", 
  //      "friendName": "Khan",
  //       "friendProfile": "https://res.cloudinary.com/degeiws8x/image/upload/v1745147626/users/6804d6e292f4071bf903886a/profilePic.jpg",
  //        "mode": "voice",
  //        "type": "outgoingcall" }

  const handleAccept = () => {
    stopRingtone();
    clearTimeout(autoDismissTimer.current);
    setIncomingCall((prev) => ({
      ...prev,
      type: "accepted",
    }));

    AcceptCall(incomingCall);

    navigation.navigate("callScreen", {
      callerId: incomingCall.callerId,
      calleeName: incomingCall.callerName,
      calleeProfilePic: incomingCall.callerProfile,
      type: incomingCall.type,
      mode: incomingCall.mode,
    });

    setIncomingCall(null);
  };

  const handleReject = async () => {
    stopRingtone();
    clearTimeout(autoDismissTimer.current);
    const props = {
      from: incomingCall.friendId,
      to: incomingCall.callerId,
    };
    cancelCalling(props);
    await addCallingEntryToChat(incomingCall.callerId, {
      type: "Rejected",
      mode: incomingCall.mode,
      time: new Date(),
    })
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }, { scale: pulseAnim }] },
      ]}
    >
      <Image
        source={{
          uri: incomingCall?.callerProfile || "https://i.pravatar.cc/150?img=3",
        }}
        style={styles.avatar}
      />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.name}>{incomingCall.callerName}</Text>
        <Text style={styles.callText}>Incoming voice call...</Text>
      </View>
      <TouchableOpacity style={styles.iconButtonRed} onPress={handleReject}>
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButtonGreen} onPress={handleAccept}>
        <Ionicons name="call" size={24} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: "#25D366",
    borderWidth: 1.5,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  callText: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 2,
  },
  iconButtonRed: {
    backgroundColor: "#FF3B30",
    borderRadius: 24,
    padding: 10,
    marginLeft: 10,
  },
  iconButtonGreen: {
    backgroundColor: "#25D366",
    borderRadius: 24,
    padding: 10,
    marginLeft: 6,
  },
});

export default IncomingCallBanner;
