import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Users } from '../../lib/data';

export default function Status({ user }) {
  const [hasPermission, setHasPermission] = useState(null);
  const navigation = useNavigation(); // Fix navigation issue

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handlePress = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      navigation.navigate('UploadStatus'); // Navigate if permission is granted
    } else {
      Alert.alert(
        'Camera Permission Required',
        'This app needs access to your camera. Please enable it in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }, // Redirect to settings
        ]
      );
    }
  };

  const Item = ({ name, image }) => (
    <TouchableOpacity style={styles.userCtn} activeOpacity={0.6}>
      <View style={styles.imageWrapper}>
        <Image style={styles.image} source={image} resizeMode='cover' />
        <View style={styles.statusBorder}></View>
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status</Text>

      <ScrollView
        horizontal
        contentContainerStyle={styles.statusCtn}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.myStatusCtn} onPress={handlePress} activeOpacity={0.6}>
          <View style={styles.imageWrapper}>
            <Image
              style={styles.image}
              source={require('../../assets/images/samuel.jpg')}
              resizeMode='cover'
            />
            <TouchableOpacity style={styles.addIcon}>
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.name} numberOfLines={1}>Add status</Text>
        </TouchableOpacity>

        <FlatList
          data={Users}
          renderItem={({ item }) => <Item name={item.name} image={item.image} />}
          keyExtractor={item => item.id}
          horizontal
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202020',
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
  },
  statusCtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myStatusCtn: {
    alignItems: 'center',
    marginRight: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  statusBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#25D366',
  },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#25D366',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  addText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    top: -2.5
  },
  userCtn: {
    alignItems: 'center',
    margin: 12,
  },
  name: {
    fontSize: 13,
    color: 'white',
    marginTop: 4,
    maxWidth: 70,
    textAlign: 'center',
  },
});
