import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { MaterialIcons } from '@expo/vector-icons';

export default function VideoEditing() {
    const [videoUri, setVideoUri] = useState(null);
    const [thumbnails, setThumbnails] = useState([]);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);

    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'video/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;

                if (uri.startsWith('file://')) {
                    setVideoUri(uri);
                    setThumbnails([]);  // Clear existing thumbnails
                    Alert.alert('Video selected', result.assets[0].name);
                } else {
                    Alert.alert('Invalid video URI. Please select a proper file.');
                }
            } else {
                Alert.alert('Video selection canceled');
            }
        } catch (error) {
            console.error('Error picking video:', error);
        }
    };

    const generateThumbnails = async () => {
        if (!videoUri) return;

        setLoading(true);
        const interval = 1000; // Generate thumbnail for every 1 second
        const thumbnailsArray = [];
        
        try {
            // Get video duration using expo-av
            const videoAsset = await FileSystem.readAsStringAsync(videoUri);
            const video = videoRef.current;
            video.loadAsync({ uri: videoUri }, {}, false).then(() => {
                const duration = video.durationMillis / 1000;  // Convert to seconds
                const totalFrames = Math.floor(duration / interval);

                // Generate thumbnails for every second
                for (let i = 0; i <= totalFrames; i++) {
                    const time = i * interval;
                    const thumbnail = await VideoThumbnails.getThumbnailAsync(videoUri, { time });
                    thumbnailsArray.push(thumbnail.uri);
                }
                setThumbnails(thumbnailsArray);
                setLoading(false);
            });
        } catch (error) {
            console.error("Error generating thumbnails: ", error);
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Video Segmenter</Text>

            {videoUri && (
                <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    useNativeControls
                    resizeMode="contain"
                    style={{ width: '100%', height: 200, marginTop: 20 }}
                />
            )}

            <TouchableOpacity style={styles.button} onPress={pickVideo}>
                <MaterialIcons name="video-library" size={24} color="white" />
                <Text style={styles.buttonText}>Select Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4CAF50' }]}
                onPress={generateThumbnails}
                disabled={loading || !videoUri}
            >
                <MaterialIcons name="content-cut" size={24} color="white" />
                <Text style={styles.buttonText}>Generate Thumbnails</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}

            <ScrollView horizontal style={styles.thumbnailRow}>
                {thumbnails.map((thumb, idx) => (
                    <Image
                        key={idx}
                        source={{ uri: thumb }}
                        style={styles.thumbnail}
                    />
                ))}
            </ScrollView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    thumbnailRow: {
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    thumbnail: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 8,
    },
});
