import React, { useEffect, useState } from "react";
import {
    View, TextInput, Image, StyleSheet, Dimensions,
    TouchableOpacity, FlatList, Text, PanResponder, Animated
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "react-native-vector-icons";

export default function UploadImageStatus({ route, navigation }) {
    const { imageUri } = route.params;
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState([
        {
            id: 1,
            imageUri: imageUri,
            emojis: [
                { emoji: '😀', position: { x: 50, y: 50 }, scale: 1 },
                { emoji: '😎', position: { x: 100, y: 100 }, scale: 1.5 },
            ],
            text: ['Feeling great today!'],
            caption: 'Chilling with my shades.',
        }
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        if (status.length === 0) {
            navigation.navigate("UploadStatus");
        }
    }, [status]);

    const handleBack = () => navigation.goBack();

    const handleAttachment = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1
        });

        if (!result.canceled) {
            setStatus([...status, { id: status.length, imageUri: result.assets[0].uri, emojis: [], text: [], caption: [] }]);
        }
    };

    const handleRemoveImage = (index) => {
        const newStatus = status.filter((_, i) => i !== index);
        setStatus(newStatus);
        if (index === selectedIndex && index !== 0) {
            setSelectedIndex(index - 1);
        }
    };

    const handleEmojiSelect = (emoji) => {
        setShowEmojiPicker(false);
        const updatedStatus = [...status];
        updatedStatus[selectedIndex].emojis.push({
            id: Date.now(),
            emoji,
            position: { x: 100, y: 100 },
            scale: 1
        });
        setStatus(updatedStatus);
    };

    const createPanResponder = (statusId, emojiIndex) => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                const { moveX, moveY } = gestureState;
                const updatedStatuses = status.map((stat) => {
                    if (stat.id === statusId) {
                        const updatedEmojis = [...stat.emojis];
                        updatedEmojis[emojiIndex] = {
                            ...updatedEmojis[emojiIndex],
                            position: { x: moveX, y: moveY },
                        };
                        return { ...stat, emojis: updatedEmojis };
                    }
                    return stat;
                });
                setStatus(updatedStatuses);
            },
        });
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: status[selectedIndex].imageUri }} style={styles.backgroundImage} />
            <View style={styles.iconRow}>
                <TouchableOpacity onPress={handleBack}>
                    <Icon name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>

                <View style={styles.iconsLeft}>
                    <TouchableOpacity><Icon name="music" size={20} color="#fff" /></TouchableOpacity>
                    <TouchableOpacity><Icon name="crop" size={20} color="#fff" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowEmojiPicker(true)}>
                        <Icon name="smile-o" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowText(true)}><Icon name="font" size={20} color="#fff" /></TouchableOpacity>
                </View>
            </View>

            {status[selectedIndex].emojis.map((emoji, index) => (
                <View
                    key={emoji.id}
                    style={[styles.emojiContainer, { top: emoji.position.y, left: emoji.position.x, transform: [{ scale: emoji.scale }] }]}
                    {...createPanResponder(status[selectedIndex].id, index).panHandlers}
                >
                    <Text style={styles.emojiText}>{emoji.emoji}</Text>
                </View>
            ))}

            {showEmojiPicker && (
                <View style={styles.emojiPicker}>
                    {["😀", "😂", "😍", "😎", "🥳"].map((emoji, index) => (
                        <TouchableOpacity key={index} onPress={() => handleEmojiSelect(emoji)}>
                            <Text style={{ fontSize: 30, margin: 5 }}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {showText && (
                <View style={styles.emojiPicker}>
                    {["😀", "😂", "😍", "😎", "🥳"].map((emoji, index) => (
                        <TouchableOpacity key={index} onPress={() => handleEmojiSelect(emoji)}>
                            <Text style={{ fontSize: 30, margin: 5 }}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <FlatList
                data={status}
                horizontal
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity onPress={() => setSelectedIndex(index)}>
                        <View style={[styles.imageContainer, selectedIndex === index ? styles.selectedImage : {}]}>
                            <Image source={{ uri: item.imageUri }} style={styles.smallImage} />
                            <TouchableOpacity style={styles.removeIcon} onPress={() => handleRemoveImage(index)}>
                                <Icon name="times" size={12} color="white" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
                style={styles.imageList}
            />

            <View style={styles.inputWrapper}>
                <TouchableOpacity onPress={handleAttachment} style={styles.inputIcon}>
                    <MaterialCommunityIcons name="attachment" size={24} color="white" />
                </TouchableOpacity>
                <TextInput
                    style={styles.messageInput}
                    placeholder="Add a Caption..."
                    placeholderTextColor="#888"
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendButton}>
                    <MaterialCommunityIcons name="send" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundImage: { width: "100%", height: "100%", position: "absolute" },
    imageList: { position: "absolute", bottom: 140, left: "5%", right: "5%" },
    imageContainer: { position: "relative", marginHorizontal: 5 },
    smallImage: { width: 60, height: 60, borderRadius: 10 },
    removeIcon: { position: "absolute", top: 1, right: 1, backgroundColor: "green", borderRadius: 10, padding: 2 },
    selectedImage: { borderColor: "green", borderWidth: 2, borderRadius: 12 },
    iconRow: { position: "absolute", top: 30, left: "5%", right: "5%", flexDirection: "row", justifyContent: "space-between", width: "90%" },
    iconsLeft: { flexDirection: "row", justifyContent: "space-between", width: "60%" },
    inputWrapper: { position: "absolute", bottom: 80, left: "5%", right: "5%", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 10, borderRadius: 50 },
    messageInput: { flex: 1, color: "#fff", fontSize: 16, padding: 10 },
    emojiText: { fontSize: 30 },
    emojiContainer: { position: "absolute", zIndex: 2 },
    emojiPicker: { position: "absolute", bottom: '50%', left: "10%", right: "10%", flexDirection: "row", backgroundColor: "rgba(0,0,0,0.8)", padding: 10, borderRadius: 10 },
});
