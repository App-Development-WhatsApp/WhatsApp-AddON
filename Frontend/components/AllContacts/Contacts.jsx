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
import { useNetInfo } from '@react-native-community/netinfo';
import { loadUserInfo } from '../../utils/chatStorage';

export default function Contacts() {
    const navigation = useNavigation();
    const netInfo = useNetInfo();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [currUser, setcurrUser] = useState(null);

    useEffect(() => {
        console.log(netInfo.isConnected)
        const fetchUsers = async () => {
            const userData = await loadUserInfo();
            setcurrUser(userData);
            setLoading(true);
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

        if (netInfo.isConnected) {
            fetchUsers();
        }
    }, [netInfo.isConnected]);

    const handleChatPress = async (id, name, image) => {
        try {
            const generateRoomId = (uid1, uid2) => {
                return ['' + uid1, '' + uid2].sort().join('_');
            };

            navigation.navigate('Chatting', {
                userId: id,
                name,
                image,
                roomId: generateRoomId(currUser?._id, id)
            });

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
