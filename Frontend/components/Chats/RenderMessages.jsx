import React from "react";
import { Audio } from 'expo-av';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
} from "react-native";
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons'; // or use any icon library
import * as Print from 'expo-print';
import { useFocusEffect } from '@react-navigation/native';
import { NativeModules } from 'react-native';


export const renderFilePreview = (file, fileLoading, send) => {

    const previewStyles = {
        width: 250,
        height: 150,
        borderRadius: 10,
        backgroundColor: "#1e1e1e",
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        position: 'relative',
    };

    const handlePrintPDF = async () => {
        try {
            await Print.printAsync({ uri: file.uri || file.url });
        } catch (error) {
            Alert.alert("Print Error", "Unable to print PDF");
        }
    };

    const statusIcon = () => {
        if (fileLoading && !send) {
            return <ActivityIndicator size="small" color="limegreen" style={{ position: 'absolute', alignSelf: 'center' }} />;
        } else if (!fileLoading && send) {
            return <Ionicons name="checkmark-circle" size={24} color="limegreen" style={{ position: 'absolute', right: 8, top: 8 }} />;
        } else if (!fileLoading && !send) {
            return <Ionicons name="alert-circle" size={24} color="red" style={{ position: 'absolute', right: 8, top: 8 }} />;
        } else {
            return null;
        }
    };

    let content;
    if (file.mimeType.startsWith("image/")) {
        content = <Image source={{ uri: file.uri || file.url }} style={previewStyles} resizeMode="cover" />;
    } else if (file.mimeType.startsWith("audio/")) {
        content = (
            <View style={previewStyles}>
                <Text style={{ color: 'white' }}>🎵 Audio file</Text>
                <Text style={{ color: 'white', fontSize: 12 }}>Playback UI can be added</Text>
            </View>
        );
    } else if (file.mimeType.startsWith("video/")) {
        content = (
            <Video
                source={{ uri: file.uri || file.url }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                useNativeControls
                style={previewStyles}
            />
        );
    } else if (file.mimeType === "application/pdf") {
        content = (
            <TouchableOpacity onPress={handlePrintPDF} style={previewStyles}>
                <Text style={{ color: 'white' }}>📄 Tap to Print PDF</Text>
                <Text style={{ color: 'white', fontSize: 12 }}>{file.name || 'PDF File'}</Text>
            </TouchableOpacity>
        );
    } else {
        content = (
            <View style={previewStyles}>
                <Text style={{ color: 'white' }}>📎 {file.name || 'Unnamed File'}</Text>
            </View>
        );
    }

    return (
        <View style={{ position: 'relative' }}>
            {content}
            {statusIcon()}
        </View>
    );
};



const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const renderMessage = ({ item, currentUserId, index }) => {
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
    const isMyMessage = item.senderId === currentUserId;
    const formattedTime = item.timestamp ? formatTime(item.timestamp) : "";
    const isShortMessage = item.text && item.text.length < 40;
    // console.log(item)

    return (
        <View key={index} style={styles.messageContainer}>
            <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
                {Array.isArray(item.files) &&
                    item.files.map((file, index) => (
                        <View key={index} style={{ marginVertical: 4 }}>
                            {renderFilePreview(file, Loading, send)}
                        </View>
                    ))}
                {item.text && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" }}>
                        <Text style={styles.messageText}>{item.text}</Text>
                        {isShortMessage && (
                            <Text style={styles.inlineTimestamp}>{formattedTime}</Text>
                        )}
                    </View>
                )}

                {!isShortMessage && (
                    <Text style={styles.timestampText}>{formattedTime}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    messageBubble: {
        padding: 8,
        borderRadius: 12,
        marginVertical: 4,
        maxWidth: "75%",
        margin: 5,
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#005c4b"
    },
    theirMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#202c33"
    },
    messageText: {
        color: "white",
        flexShrink: 1,
        maxWidth: "85%"
    },
    inlineTimestamp: {
        fontSize: 10,
        color: "#ccc",
        alignSelf: "flex-end",
        marginLeft: 8
    },
    timestampText: {
        fontSize: 10,
        color: "#ccc",
        alignSelf: "flex-end",
        marginTop: 5
    }
});
