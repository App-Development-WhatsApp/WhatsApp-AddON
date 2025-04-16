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
import { getAllUsers } from '../../Services/AuthServices';
import { useNetInfo } from '@react-native-community/netinfo';
import { loadUserInfo } from '../../utils/chatStorage';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Contacts() {
    const navigation = useNavigation();
    const netInfo = useNetInfo();
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [currUser, setcurrUser] = useState(null);

    useEffect(() => {
        setLoading(true);
        const fetchUsers = async () => {
            const userData = await loadUserInfo();
            setcurrUser(userData);
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
                roomId: generateRoomId(currUser?.id, id)
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
                        <Text style={styles.name}>{userName} {userId}</Text>
                        {/* You can add status/subtext here if available */}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const ActionButton = ({ icon, text, rightIcon, onPress }) => (
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
            <View style={styles.iconWrap}>{icon}</View>
            <Text style={styles.actionText}>{text}</Text>
            {rightIcon && <View style={styles.qrWrap}>{rightIcon}</View>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.topTitle}>Select contact</Text>
                    <Text style={styles.topSubtitle}>{users.length} contacts</Text>
                </View>
                <View style={styles.topIcons}>
                    <Ionicons name="search" size={22} color="white" style={{ marginRight: 20 }} />
                    <MaterialIcons name="more-vert" size={22} color="white" />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text style={styles.loadingText}>Fetching profiles...</Text>
                </View>
            ) : (
                <ScrollView>
                    <View style={styles.actionsContainer}>
                        <ActionButton
                            icon={<Ionicons name="people" size={24} color="white" />}
                            text="New group"
                            onPress={() => {
                                console.log("hi");
                                navigation.navigate("CreateGroup");
                            }} />
                        <ActionButton
                            icon={<Ionicons name="person-add" size={24} color="white" />}
                            text="New contact"
                            rightIcon={<MaterialIcons name="qr-code" size={18} color="white" />}
                        />

                    </View>

                    <Text style={styles.contactsLabel}>Contacts on WhatsApp</Text>

                    <FlatList
                        nestedScrollEnabled={true}
                        data={users}
                        renderItem={({ item }) => (
                            <Item key={item._id} userId={item._id} userName={item.username} image={item.profilePic} />
                        )}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                    />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#121212',
        flex: 1
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    topTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    topSubtitle: {
        color: '#bbb',
        fontSize: 12,
    },
    topIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionsContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconWrap: {
        width: 40,
        height: 40,
        backgroundColor: '#007b5f',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        flex: 1
    },
    qrWrap: {
        marginRight: 15
    },
    contactsLabel: {
        color: '#aaa',
        fontSize: 13,
        marginVertical: 10,
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
        fontSize: 17,
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
        fontSize: 16
    }
});