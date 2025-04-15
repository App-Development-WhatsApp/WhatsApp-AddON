import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

export default function PDFViewer() {
  const [pdfUri, setPdfUri] = useState(null);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 PDF Viewer</Text>

      <TouchableOpacity style={styles.button} onPress={pickPDF}>
        <MaterialIcons name="picture-as-pdf" size={24} color="white" />
        <Text style={styles.buttonText}>Select PDF</Text>
      </TouchableOpacity>

      {pdfUri && (
        <View style={styles.pdfWrapper}>
          <WebView
            source={{ uri: pdfUri }}
            style={styles.pdfViewer}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    marginVertical: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  pdfWrapper: {
    width: '80%',
    height: 805,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignSelf: 'center',
  },
  pdfViewer: {
    flex: 1,
  },
});
