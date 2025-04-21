import React, { useEffect } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import * as Print from 'expo-print';
import Ionicons from '@expo/vector-icons/Ionicons'; // Make sure to install expo/vector-icons
import { Audio } from 'expo-av';

const OneTimeViewer = ({ route, navigation }) => {
  const { file, text } = route.params;

  const handlePrintPDF = async () => {
    try {
      await Print.printAsync({ uri: file.uri || file.url });
    } catch (error) {
      Alert.alert("Print Error", "Unable to print PDF");
    }
  };


  const renderContent = () => {
    const uri = file.uri || file.url;
    const mime = file.mimeType;

    if (mime.startsWith("image/")) {
      return <Image source={{ uri }} style={styles.fullContent} resizeMode="contain" />;
    }

    if (mime.startsWith("video/")) {
      return (
        <Video
          source={{ uri }}
          style={styles.fullContent}
          resizeMode="contain"
          controls
        />
      );
    }

    if (mime.startsWith("audio/")) {
      return (
        <View style={styles.centered}>
          <Text style={styles.whiteText}>🎵 Audio file</Text>
          <Text style={[styles.whiteText, { fontSize: 12 }]}>Playback UI can be added</Text>
        </View>
      );
    }

    if (mime === "application/pdf") {
      return (
        <TouchableOpacity onPress={handlePrintPDF} style={styles.centered}>
          <Text style={styles.whiteText}>📄 Tap to Print PDF</Text>
          <Text style={[styles.whiteText, { fontSize: 12 }]}>{file.name || 'PDF File'}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.centered}>
        <Text style={styles.whiteText}>📎 {file.name || 'Unnamed File'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {renderContent()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{text}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OneTimeViewer;

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullContent: {
    width: width,
    height: height * 0.75,
  },
  footer: {
    padding: 16,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
  },
  closeText: {
    color: '#0af',
    fontSize: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  whiteText: {
    color: 'white',
  },
  statusIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  statusIconCenter: {
    position: 'absolute',
    alignSelf: 'center',
  },
});
