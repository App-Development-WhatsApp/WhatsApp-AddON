import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useFocusEffect } from '@react-navigation/native';
import { NativeModules } from 'react-native';

export default function PDFViewer() {
  const [pdfUri, setPdfUri] = useState(null);

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      NativeModules?.RNPreventScreenshot?.forbid();
    }
    return () => {
      if (Platform.OS === 'android') {
        NativeModules?.RNPreventScreenshot?.allow();
      }
    };
  });

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setPdfUri(uri);
        Alert.alert('PDF selected', result.assets[0].name);
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
    }
  };

  const handleViewPDF = async () => {
    if (pdfUri) {
      try {
        await Print.printAsync({ uri: pdfUri });
      } catch (error) {
        Alert.alert('Print Error', 'Unable to render PDF');
      }
    } else {
      Alert.alert('No PDF Selected', 'Please select a PDF first.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 PDF Viewer</Text>

      <TouchableOpacity style={styles.button} onPress={pickPDF}>
        <MaterialIcons name="picture-as-pdf" size={24} color="white" />
        <Text style={styles.buttonText}>Select PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={handleViewPDF}
        disabled={!pdfUri}
      >
        <MaterialIcons name="visibility" size={24} color="white" />
        <Text style={styles.buttonText}>View PDF</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
});
