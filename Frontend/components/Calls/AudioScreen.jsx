import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import socket from '../../utils/socket';

const AudioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { callerId, friendId, friendName, Profile } = route.params;
  const [status, setStatus] = useState('Calling...');

  useEffect(() => {
    
    socket.emit('call-user', { from: callerId, to: friendId });

    socket.on('call-answered', () => {
      setStatus('Call answered');
      navigation.replace('VoiceRoom', { callerId, friendId });
    });

    socket.on('call-rejected', () => {
      setStatus('Call rejected');
      setTimeout(() => navigation.goBack(), 2000);
    });

    return () => {
      socket.off('call-answered');
      socket.off('call-rejected');
    };
  }, []);

  const cancelCall = () => {
    socket.emit('cancel-call', { to: friendId });
    navigation.goBack();
  };
  const validImage = Profile ? { uri: Profile } : require('../../assets/images/blank.jpeg');


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
