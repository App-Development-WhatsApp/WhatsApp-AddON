import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
export  const downloadToLocal = async (url, fileName) => {
    try {
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);
      return uri;
    } catch (error) {
      console.error("Download error:", error);
      return url; // fallback to cloud URL
    }
  };