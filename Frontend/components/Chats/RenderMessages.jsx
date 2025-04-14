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

export const renderFilePreview = (file) => {
    const previewStyles = {
        width: 250,
        height: 150,
        borderRadius: 10,
        backgroundColor: "#1e1e1e",
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    };

    if (file.mimeType.startsWith("image/")) {
        return (
            <Image
                source={{ uri: file.uri || file.url }}
                style={previewStyles}
                resizeMode="cover"
            />
        );
    } else if (file.mimeType.startsWith("audio/")) {
        return (
            <View style={previewStyles}>
                <Text style={{ color: 'white' }}>🎵 Audio file</Text>
                <Text style={{ color: 'white', fontSize: 12 }}>Playback UI can be added</Text>
            </View>
        );
    } else if (file.mimeType.startsWith("video/")) {
        return (
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
        return (
            <View style={previewStyles}>
                <Text style={{ color: 'white' }}>📄 PDF file</Text>
                <Text style={{ color: 'white', fontSize: 12 }}>Use `react-native-pdf` to render</Text>
                <Pdf
                    trustAllCerts={false}
                    source={PdfResource}
                    style={styles.pdf}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`number of pages: ${numberOfPages}`);
                    }}
                />
            </View>
        );
    } else {
        return (
            <View style={previewStyles}>
                <Text style={{ color: 'white' }}>📎 {file.name || 'Unnamed File'}</Text>
            </View>
        );
    }
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

export const renderMessage = ({ item, currentUserId }) => {
    const isMyMessage = item.senderId === currentUserId;
    const formattedTime = item.timestamp ? formatTime(item.timestamp) : "";
    const isShortMessage = item.text && item.text.length < 40;

    return (
        <View style={styles.messageContainer}>
            <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
                {Array.isArray(item.files) &&
                    item.files.map((file, index) => (
                        <View key={index} style={{ marginVertical: 4 }}>
                            {renderFilePreview(file)}
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
