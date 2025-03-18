import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function AvatarScreen({ navigation }) {
  return (
    <View style={styles.container}>
        <View style={styles.titleBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Avatar</Text>
        </View>

      {/* Avatar Image Placeholder */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: 'https://example.com/avatar-placeholder.png' }} // Replace with actual avatar image URL
          style={styles.avatarImage}
        />
      </View>

      <Text style={styles.description}>
        Say more with Avatars now on WhatsApp
      </Text>

      {/* Create Avatar Button */}
      <TouchableOpacity style={styles.createAvatarButton}>
        <Text style={styles.buttonText}>Create your Avatar</Text>
      </TouchableOpacity>

      {/* Learn More */}
      <TouchableOpacity>
        <Text style={styles.learnMore}>Learn more</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#1C1C1C',
  },
  backButton: {
    paddingRight: 15,
  },
  backText: {
    fontSize: 30,
    color: 'white',
  },
  title: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  createAvatarButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 20,
    marginLeft: 100,
    marginRight: 100,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  learnMore: {
    color: '#00AFFF',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginLeft: 170
  },
});
