import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from "expo-av";
import { useSocket } from '../../context/SocketContext';
import { addCallingEntryToChat, loadUserInfo } from '../../utils/chatStorage';
const AudioScreen = () => {
  const { incomingCall, setIncomingCall, cancelCalling, callFriend, RegistercalcelCall, UnRegistercalcelCall, RegisterAcceptCall, UnRegisterAcceptCall } = useSocket();
  const navigation = useNavigation();
  const route = useRoute();
  const ringtone = useRef(null);

  const { callerId, friendId, type, mode, friendName, callerName, callerProfile, friendProfile } = route.params;
  const [status, setStatus] = useState('Calling...');
  useEffect(() => {
    playRingtone();
  }, [])

  useEffect(() => {
    callFriend(route.params);

    RegistercalcelCall((props) => {
      console.log("canceling sun le nsdk",props)
      stopRingtone();
      setStatus('Call cancelled');
      navigation.replace("Chatting", { userId: friendId, name: friendName, image: friendProfile }); // Replace with your desired fallback
    })
    RegisterAcceptCall((props) => {
      console.log("Accept call props:", props);
      setStatus('Call accepted');
      stopRingtone();
      navigation.replace("callScreen", {
        callerId: friendId,
        calleeName: friendName,
        calleeProfilePic: friendProfile,
        type: props.type,
        mode: props.mode,
      });
    })


    return () => {
      // Cleanup function to unregister incoming call listeners
      UnRegisterAcceptCall();
      UnRegistercalcelCall();
      // Stop the ringtone if it's playing
      if (ringtone.current) {
        ringtone.current.stopAsync();
      }
    };
  }, [RegistercalcelCall]);

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
  const cancelCall = async () => {
    // console.log(incomingCall)
    const props = {
      to: friendId,
      from: callerId,
    };
    console.log(props)
    await addCallingEntryToChat(friendId, {
      type: "Not Accepted",
      mode: mode,
      time: new Date(),
    })

    cancelCalling(props);
    navigation.goBack();
  };
  const validImage = friendProfile ? { uri: friendProfile } : require('../../assets/images/blank.jpeg');


  return (
    <View style={styles.container}>
      <Image source={validImage} style={styles.avatar} />
      <Text style={styles.name}>{friendName}</Text>
      <Text style={styles.status}>{status}</Text>
      <ActivityIndicator color="#fff" size="small" style={{ marginTop: 10 }} />

      <TouchableOpacity style={styles.endCallButton} onPress={cancelCall}>
        <Ionicons name="call" size={28} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B141A', // WhatsApp dark background
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#25D366',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
    color: '#aaa',
  },
  endCallButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'red',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AudioScreen;