import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

export const AudioPlayer = ({ uri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        setSound(sound);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load sound', error);
        setLoading(false);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const togglePlayback = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }

    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return <ActivityIndicator color="white" />;
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity onPress={togglePlayback} style={{ padding: 10, backgroundColor: '#0af', borderRadius: 5 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isPlaying ? 'Pause Audio' : 'Play Audio'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
