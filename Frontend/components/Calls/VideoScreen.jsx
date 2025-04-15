import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { RTCView, mediaDevices, RTCPeerConnection } from 'react-native-webrtc';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const VideoCall = ({ route, navigation }) => {
  const { roomId } = route.params;

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const pc = useRef(new RTCPeerConnection(configuration));

  useEffect(() => {
    startLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      pc.current.close();
    };
  }, []);

  const startLocalStream = async () => {
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setLocalStream(stream);
    stream.getTracks().forEach(track => pc.current.addTrack(track, stream));

    // In production, use signaling (Socket.IO) to connect with peer.
    // For demo, simulate remote stream with your own stream:
    pc.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Simulate connection (loopback)
    setRemoteStream(stream);
  };

  const toggleMic = () => {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setMicOn(prev => !prev);
  };

  const toggleCam = () => {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setCamOn(prev => !prev);
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    pc.current.close();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.callInfo}>Room: {roomId}</Text>

      {/* Remote Video */}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      )}

      {/* Local Video */}
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
        />
      )}

      {/* Call Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMic}>
          <Ionicons name={micOn ? "mic" : "mic-off"} size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButtonEnd} onPress={endCall}>
          <MaterialIcons name="call-end" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCam}>
          <Ionicons name={camOn ? "videocam" : "videocam-off"} size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VideoCall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  callInfo: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 16,
    zIndex: 10,
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#222',
  },
  localVideo: {
    position: 'absolute',
    top: 70,
    right: 15,
    width: 100,
    height: 150,
    backgroundColor: '#444',
    borderRadius: 10,
    zIndex: 9,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 50,
  },
  controlButtonEnd: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
  },
});
