import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import Header from '../Chats/Header';
import Search from '../Chats/Search';
import { getAllUsers } from '../../Services/AuthServices';

const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json"; // Correct file path for storing friends

export default function Contacts() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            console.log("hello")
            // setLoading(true);
            try {
                const res = await getAllUsers();
                if (res.success) {
                    setUsers(res.users);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        const loadFriends = async () => {
            try {
                const fileExists = await FileSystem.getInfoAsync(friendsFilePath);
                if (fileExists.exists) {
                    const storedData = await FileSystem.readAsStringAsync(friendsFilePath);
                    setFriends(JSON.parse(storedData) || []);
                }
            } catch (error) {
                console.error("Error loading friends:", error);
            }
        };

        fetchUsers();
        loadFriends();
    }, []);

    const handleChatPress = async (id, name, image) => {
        try {
            let storedFriends = [];

            const fileExists = await FileSystem.getInfoAsync(friendsFilePath);
            if (fileExists.exists) {
                const fileData = await FileSystem.readAsStringAsync(friendsFilePath);
                storedFriends = JSON.parse(fileData) || [];
            }

            // Check if user is already in the friends list
            if (!storedFriends.some(user => user.userId === id)) {
                const newUser = { userId: id, userName: name, image, message: "Say hi!", time: "Now" };
                storedFriends.push(newUser);

                await FileSystem.writeAsStringAsync(friendsFilePath, JSON.stringify(storedFriends, null, 2));
                setFriends(storedFriends); // Update local state
            }

            navigation.navigate('Chatting', { userId: id, name, image });

        } catch (error) {
            console.error("Error adding user to friends:", error);
        }
    };

    const Item = ({ userId, userName, image }) => {
        const validImage = image ? { uri: image } : require('../../assets/images/blank.jpeg');

        return (
            <TouchableOpacity onPress={() => handleChatPress(userId, userName, image)}>
                <View style={styles.userCtn}>
                    <Image
                        style={styles.image}
                        source={validImage}
                        borderRadius={50}
                        resizeMode="cover"
                    />
                    <View style={styles.msgCtn}>
                        <Text style={styles.name}>{userName}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text style={styles.loadingText}>Fetching profiles...</Text>
                </View>
            ) : (
                <ScrollView contentInsetAdjustmentBehavior="automatic">
                    <Header />
                    <View style={styles.chatCtn}>
                        <FlatList
                            data={users}
                            renderItem={({ item }) => (
                                <Item key={item._id} userId={item._id} userName={item.username} image={item.profilePic} />
                            )}
                            keyExtractor={item => item._id}
                            horizontal={false}
                            scrollEnabled={false}
                            ListHeaderComponent={Search}
                        />
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#011513',
        height: '100%'
    },
    chatCtn: {
        marginTop: 20,
    },
    userCtn: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        marginBottom: 25,
    },
    msgCtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
    },
    image: {
        width: 55,
        height: 55,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: '#cbd5c0',
        fontSize: 16
    }
});
