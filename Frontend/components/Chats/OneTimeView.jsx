// import { useEffect } from 'react';
// import { View, Image, Text, TouchableOpacity } from 'react-native';
// import Video from 'react-native-video';
// import { Audio } from 'expo-av';
// import Pdf from 'react-native-pdf';
// import FileViewer from 'react-native-file-viewer';
// // import { AudioPlayer } from './AudioPlayer'; // Assuming you have an AudioPlayer component

// const OneTimeViewer = ({ route, navigation }) => {
//   const { file, onViewed } = route.params;

//   useEffect(() => {
//     const unsubscribe = navigation.addListener('beforeRemove', () => {
//       onViewed(); // Mark as viewed
//     });
//     return unsubscribe;
//   }, []);

//   const openWithExternalViewer = async () => {
//     try {
//       await FileViewer.open(file.uri || file.url, { showOpenWithDialog: true });
//     } catch (error) {
//       console.error('Error opening file:', error);
//     }
//   };

//   const renderContent = () => {
//     if (file.mimeType.startsWith("image/")) {
//       return <Image source={{ uri: file.url || file.uri }} style={{ width: '90%', height: '70%' }} resizeMode="contain" />;
//     }
//     if (file.mimeType.startsWith("video/")) {
//       return <Video source={{ uri: file.url || file.uri }} style={{ width: '90%', height: 300 }} controls resizeMode="contain" />;
//     }
//     // if (file.mimeType.startsWith("audio/")) {
//     //     return <AudioPlayer uri={file.url || file.uri} />;
//     //   }
//     if (file.mimeType === 'application/pdf') {
//       return <Pdf source={{ uri: file.url || file.uri }} style={{ width: '90%', height: '70%' }} />;
//     }

//     return (
//       <TouchableOpacity onPress={openWithExternalViewer}>
//         <Text style={{ color: '#0af', fontSize: 16 }}>Open in External Viewer</Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
//       {renderContent()}
//       <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
//         <Text style={{ color: '#0af' }}>Close</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default OneTimeViewer;
