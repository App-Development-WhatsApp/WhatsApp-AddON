import React, { useEffect, useState } from "react";
import {
    View, TextInput, Image, StyleSheet, Dimensions,
    TouchableOpacity, FlatList, Text, PanResponder, Switch, useRef
} from "react-native";
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { segmentVideo } from "../../../utils/FFmpeg";


export default function UploadImageStatus({ route, navigation }) {
    const { selectedImages } = route.params;
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState([
        // {
        //     id: 1,
        //     mediaUri: imageUri,
        //     mediasize: size,
        //     mediaType: 'image', // 'image' or 'video'
        //     emojis: [
        //         {
        //             id: 0,
        //             emoji: '😀',
        //             position: { x: 100, y: 100 },
        //             scale: 1.5,
        //         },
        //         {
        //             id: 1,
        //             emoji: '😂',
        //             position: { x: 150, y: 150 },
        //             scale: 1.5,
        //         }
        //     ],
        //     timing: [{
        //         startTime: 0,
        //         endTime: 30,
        //     }],
        //     autotrim: false,
        //     audio: false,
        //     segments: [],
        //     text: ['Feeling great today!'],
        //     caption: 'Chilling with my shades.',
        // }
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [selectedEmojiId, setSelectedEmojiId] = useState(null); // To keep track of the emoji being resized

    const createPanResponder = (statusId, emojiIndex) => {
        let initialDistance = null;
        let initialScale = status[selectedIndex].emojis[emojiIndex].scale;

        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: () => {
                // Store current scale at gesture start
                initialScale = status[selectedIndex].emojis[emojiIndex].scale;
            },

            onPanResponderMove: (evt, gestureState) => {
                const touches = evt.nativeEvent.touches;

                if (touches.length === 2) {
                    const [touch1, touch2] = touches;

                    const dx = touch1.pageX - touch2.pageX;
                    const dy = touch1.pageY - touch2.pageY;

                    const currentDistance = Math.sqrt(dx * dx + dy * dy);

                    if (initialDistance === null) {
                        initialDistance = currentDistance;
                    } else {
                        const scaleFactor = currentDistance / initialDistance;
                        const newScale = Math.max(0.5, Math.min(3, initialScale * scaleFactor));

                        // Update scale using your function
                        const emojiId = status[selectedIndex].emojis[emojiIndex].id;
                        setSelectedEmojiId(emojiId);
                        handleEmojiScale(newScale);
                    }
                } else if (touches.length === 1) {
                    const { moveX, moveY } = gestureState;
                    setStatus((prevStatus) =>
                        prevStatus.map((stat) =>
                            stat.id === statusId
                                ? {
                                    ...stat,
                                    emojis: stat.emojis.map((emoji, index) =>
                                        index === emojiIndex
                                            ? { ...emoji, position: { x: moveX, y: moveY } }
                                            : emoji
                                    ),
                                }
                                : stat
                        )
                    );
                }
            },

            onPanResponderRelease: () => {
                initialDistance = null;
            },
        });
    };

    const renderEmojis = () => {
        return status[selectedIndex].emojis.map((emoji, index) => (
            <View
                key={emoji.id}
                style={[styles.emojiContainer,
                selectedEmojiId === emoji.id && styles.selectedEmoji, { top: emoji.position.y, left: emoji.position.x, transform: [{ scale: emoji.scale }] }]}
                {...createPanResponder(status[selectedIndex].id, index).panHandlers}
            >
                {selectedEmojiId === emoji.id && (
                    <TouchableOpacity style={styles.removeIcon} onPress={handleEmojiRemove}>
                        <Icon name="times" size={20} color="white" />
                    </TouchableOpacity>
                )}
                <Text style={{ fontSize: 30 * emoji.scale }}
                    onTouchStart={() => {
                        setSelectedEmojiId(emoji.id); // Set the selected emoji ID on touch start
                        if (emoji.id !== selectedEmojiId) {
                        } else {
                            setSelectedEmojiId(null); // Reset if the same emoji is touched again
                        }
                    }}
                >{emoji.emoji}</Text>
            </View>
        ));
    };

    useEffect(() => {
        if (selectedImages && selectedImages.length > 0) {
            const newStatuses = selectedImages.map((image, index) => ({
                id: index + 1,
                mediaUri: image.uri,
                mediasize: image.size,
                mediaType: image.mediaType || 'image',
                emojis: [],
                text: [],
                segments: [],
                caption: '',
                timing: [
                    {
                        startTime: 0,
                        endTime: 30,
                    }
                ],
                autotrim: false,
                audio: false,
            }));
            setStatus(newStatuses);
        }
    }, [selectedImages]);


    useEffect(() => {
        if (status.length === 0) {
            navigation.navigate("UploadStatus");
        }
    }, [status]);

    const handleBack = () => navigation.goBack();

    const handleAttachment = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All, // Supports both images and videos
            allowsEditing: true,
            quality: 1
        });

        if (!result.canceled) {
            if (result.assets[0].type.startsWith("video/")) {
                const segments = await segmentVideo(result.assets[0]);
                console.log("Video segments:", segments);
                setStatus([...status, {
                    id: status.length + 1,
                    mediaUri: result.assets[0].uri,
                    mediasize: result.assets[0].size,
                    mediaType: result.assets[0].type || " ", // Either 'image' or 'video'
                    emojis: [],
                    text: [],
                    segments: segments,
                    caption: ''
                }]);
            }
        };
    }
    const handleRemoveImage = (index) => {
        const newStatus = status.filter((_, i) => i !== index);
        setStatus(newStatus);
        if (index === selectedIndex && index !== 0) {
            setSelectedIndex(index - 1);
        }
        if (status.length === 0) {
            navigation.navigate("UploadStatus");
        }
    };
    const handlePlayPause = () => {
        setIsVideoPlaying(!isVideoPlaying);
    };
    const handleEmojiSelect = (emoji) => {
        setShowEmojiPicker(false);
        const updatedStatus = [...status];
        updatedStatus[selectedIndex].emojis.push({
            id: updatedStatus[selectedIndex].emojis.length,
            emoji,
            position: { x: 100, y: 100 },
            scale: 1
        });
        setStatus(updatedStatus);
    };
    const handleEmojiRemove = () => {
        console.log("Removing emoji with ID:", selectedEmojiId);
        console.log("Removing emoji:", selectedEmojiId);
        if (selectedEmojiId === null) return;
        const updatedStatus = [...status];
        updatedStatus[selectedIndex].emojis = updatedStatus[selectedIndex].emojis.filter(emoji => emoji.id !== selectedEmojiId);
        setStatus(updatedStatus);
        setSelectedEmojiId(null); // Reset selection after removal
    };
    const handleEmojiScale = (scale) => {
        setStatus((prevStatus) =>
            prevStatus.map((stat) =>
                stat.id === status[selectedIndex].id
                    ? {
                        ...stat,
                        emojis: stat.emojis.map((emoji) =>
                            emoji.id === selectedEmojiId ? { ...emoji, scale } : emoji
                        ),
                    }
                    : stat
            )
        );
    };
    return (
        <View style={styles.container}>
            {/* Conditionally render image or video */}
            {status[selectedIndex].mediaType === 'image' ? (
                <Image source={{ uri: status[selectedIndex].mediaUri }} style={styles.backgroundMedia} />
            ) : (
                <View style={styles.backgroundMedia}>
                    <ScrollView horizontal style={styles.segmentScroll}>
                        {segments.map((uri, idx) => (
                            <Video
                                key={idx}
                                source={{ uri }}
                                style={styles.video}
                                resizeMode="cover"
                                useNativeControls={false}
                                isLooping
                                shouldPlay={false}
                            />
                        ))}
                    </ScrollView>
                    <Video
                        source={{ uri: status[selectedIndex].mediaUri }}
                        style={{ height: "100%" }}
                        resizeMode="cover"
                        shouldPlay={isVideoPlaying}
                        isLooping
                    />
                    {!isVideoPlaying ? (
                        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                            <Icon name="play" size={40} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
                            <Icon name="pause" size={40} color="#fff" />
                        </TouchableOpacity>

                    )}
                </View>
            )}
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
                </View>
            </View>


            <View>{renderEmojis()}</View>

            {showEmojiPicker && (
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
                    <TouchableOpacity onPress={() => {
                        setSelectedIndex(index);
                        setIsVideoPlaying(false); // Reset video play state when switching images
                    }}>
                        <View style={[styles.imageContainer, selectedIndex === index ? styles.selectedImage : {}]}>
                            {item.mediaType === 'image' ? (
                                <Image source={{ uri: item.mediaUri }} style={styles.smallMedia} />
                            ) : (
                                <Video source={{ uri: item.mediaUri }} style={styles.smallMedia} resizeMode="cover" />
                            )}
                            <TouchableOpacity style={styles.removeIcon} onPress={() => handleRemoveImage(index)}>
                                <Icon name="times" size={16} color="white" />
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
                <TouchableOpacity style={styles.AddCaption}>
                    <MaterialCommunityIcons name="send" size={24} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    backgroundMedia: { width: "100%", height: "70%", position: "absolute", top: "10%", backgroundColor: "red" },
    playButton: { width: 60, height: 60, position: "absolute", display: 'flex', alignItems: 'center', justifyContent: 'center', top: "40%", left: "50%", transform: [{ translateX: -20 }, { translateY: -20 }], backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 90 },
    imageList: { position: "absolute", bottom: "20%", left: "5%", right: "5%" },
    imageContainer: { marginHorizontal: 2, position: "relative" },
    smallMedia: { width: 60, height: 60, borderRadius: 10 },
    selectedImage: { borderColor: "green", borderWidth: 2, borderRadius: 12 },
    iconRow: { position: "absolute", height: "5%", backgroundColor: "red", top: 30, flexDirection: "row", justifyContent: "space-between", width: "100%" },
    iconsLeft: { flexDirection: "row", justifyContent: "space-between", width: "60%" },
    inputWrapper: { position: "absolute", bottom: "10%", left: "5%", right: "5%", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 5, borderRadius: 50, marginTop: 10, borderBlockColor: "green", borderWidth: 2 },
    messageInput: { flex: 1, color: "#fff", fontSize: 16, padding: 10 },
    messageInput2: { flex: 1, color: "#fff", fontSize: 16 },
    emojiText: { fontSize: 30 },
    emojiDisplay: { marginTop: 30, flexDirection: 'row', flexWrap: 'wrap' },
    selectedEmoji: { borderWidth: 2, borderColor: 'blue', padding: 5, borderRadius: 10 },
    emojiContainer: { position: "absolute", zIndex: 2 },
    sliderContainer: { marginTop: 20, width: 200 },
    ShowCaption: { position: "absolute", textAlign: 'center', bottom: "10%", left: "5%", right: "5%", backgroundColor: "rgba(0, 0, 0, 0.5)", padding: 10, borderRadius: 10 },
    AddCaption: { backgroundColor: "green", borderRadius: 50, alignItems: "center", justifyContent: "center", padding: 10, marginLeft: 20 },
    SendSection: { position: "absolute", bottom: "0%", left: "0%", right: "0%", flexDirection: "row", alignItems: "center", backgroundColor: "rgba(127, 12, 12, 0.5)", padding: 10, marginTop: 10 },
    inputIcon: { borderRadius: 50, padding: 10, marginRight: 10 },
    removeIcon: { position: "absolute", top: -4, right: -4, backgroundColor: "green", borderRadius: 20, padding: 1, zIndex: 10 },
    emojiPicker: { position: "absolute", bottom: '50%', left: "10%", right: "10%", flexDirection: "row", backgroundColor: "rgba(0,0,0,0.8)", padding: 10, borderRadius: 10 },
});


