import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllUsers } from '../../Services/AuthServices';
import { useNetInfo } from '@react-native-community/netinfo';
import { loadUserInfo } from '../../utils/chatStorage';
import * as Contact from 'expo-contacts';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Contacts() {
    const navigation = useNavigation();
    const netInfo = useNetInfo();
    const [loading, setLoading] = useState(false);
    const [appUsers, setAppUsers] = useState([]);
    const [nonAppUsers, setNonAppUsers] = useState([]);
    const [currUser, setCurrUser] = useState(null);

    const normalizePhoneNumber = (num) => {
        return num.replace(/\D/g, '').replace(/^0+/, '');
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const userData = await loadUserInfo();
            setCurrUser(userData);

            try {
                const [usersRes, contactsRes] = await Promise.all([
                    getAllUsers(),
                    Contact.requestPermissionsAsync().then(async ({ status }) => {
                        if (status === 'granted') {
                            const { data } = await Contact.getContactsAsync({
                                fields: [Contact.Fields.PhoneNumbers],
                            });
                            // console.log('Contacts fetched:', data);
                            return data || [];
                        }
                        return []
                    }),
                ]);

                if (!usersRes.success) throw new Error("Failed to fetch users");
                const usersFromDB = usersRes.users;
                // console.log(usersFromDB)
                const contactMap = {};

                const formattedContacts = contactsRes.flatMap((contact) =>{
                   return (contact.phoneNumbers || []).map(numObj => {
                        const phone = normalizePhoneNumber(numObj.number);
                        contactMap[phone] = {
                            name: contact.name,
                            number: phone,
                        };
                        return phone;
                    })
                });

                const appUserList = [];
                const nonAppUserList = [];

                usersFromDB.forEach(user => {
                    const phone = normalizePhoneNumber(user.phoneNumber);
                    if (contactMap[phone]) {
                        appUserList.push({
                            ...contactMap[phone],
                            ...user,
                        });
                        delete contactMap[phone];
                    }
                });

                Object.values(contactMap).forEach((nonUser) => {
                    nonAppUserList.push(nonUser);
                });
                // console.log(usersFromDB)
                // console.log(nonAppUserList)

                setAppUsers(usersFromDB);
                setNonAppUsers(nonAppUserList);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (netInfo.isConnected) {
            fetchData();
        }
    }, [netInfo.isConnected]);

    const handleChatPress = (id, name, image) => {
        console.log("id->",id)
        const generateRoomId = (uid1, uid2) => {
            return ['' + uid1, '' + uid2].sort().join('_');
        };

        navigation.navigate('Chatting', {
            userId: id,
            name,
            image,
            roomId: generateRoomId(currUser?.id, id),
        });
    };

    const inviteUser = (number) => {
        const message = `Hey! I'm using our Chat App. Join me here! [Link to app]`;
        const smsUrl = `sms:${number}?body=${encodeURIComponent(message)}`;
        Linking.openURL(smsUrl);
    };

    const ActionButton = ({ icon, text, rightIcon, onPress }) => (
        <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
            <View style={styles.iconWrap}>{icon}</View>
            <Text style={styles.actionText}>{text}</Text>
            {rightIcon && <View style={styles.qrWrap}>{rightIcon}</View>}
        </TouchableOpacity>
    );

    const ContactItem = ({ user, isAppUser }) => {
        const validImage = isAppUser && user.profilePic
            ? { uri: user.profilePic }
            : require('../../assets/images/blank.jpeg');
        return (
            <TouchableOpacity
                disabled={!isAppUser}
                onPress={() =>
                    isAppUser
                        ? handleChatPress(user._id, user.username, user.profilePic)
                        : inviteUser(user.number)
                }>
                <View style={styles.userCtn}>
                    <Image
                        style={styles.image}
                        source={validImage}
                        borderRadius={50}
                        resizeMode="cover"
                    />
                    <View style={styles.msgCtn}>
                        <Text style={styles.name}>{isAppUser?user.username:user.name}</Text>
                        <Text style={styles.subtext}>{isAppUser?user.phoneNumber:user.number}</Text>
                    </View>
                    {!isAppUser && (
                        <TouchableOpacity onPress={() => inviteUser(user.number)}>
                            <Text style={styles.inviteBtn}>Invite</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.topTitle}>Select contact</Text>
                    <Text style={styles.topSubtitle}>
                        {appUsers.length} on ChatApp, {nonAppUsers.length} others
                    </Text>
                </View>
                <View style={styles.topIcons}>
                    <Ionicons name="search" size={22} color="white" style={{ marginRight: 20 }} />
                    <MaterialIcons name="more-vert" size={22} color="white" />
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text style={styles.loadingText}>Fetching contacts...</Text>
                </View>
            ) : (
                <ScrollView>
                    <View style={styles.actionsContainer}>
                        <ActionButton
                            icon={<Ionicons name="people" size={24} color="white" />}
                            text="New group"
                            onPress={() => navigation.navigate("CreateGroup")}
                        />
                        <ActionButton
                            icon={<Ionicons name="person-add" size={24} color="white" />}
                            text="New contact"
                            rightIcon={<MaterialIcons name="qr-code" size={18} color="white" />}
                            onPress={() => {}}
                        />
                    </View>

                    <Text style={styles.contactsLabel}>Contacts on ChatApp</Text>
                    <FlatList
                        data={appUsers}
                        renderItem={({ item }) => <ContactItem user={item} isAppUser={true} />}
                        keyExtractor={(item) => item._id}
                        scrollEnabled={false}
                    />

                    <Text style={styles.contactsLabel}>Invite to ChatApp</Text>
                    <FlatList
                        data={nonAppUsers}
                        renderItem={({ item }) => <ContactItem user={item} isAppUser={false} />}
                        keyExtractor={(item, index) => index.toString()}
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
        flex: 1,
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
    contactsLabel: {
        color: '#aaa',
        fontSize: 13,
        marginVertical: 10,
    },
    userCtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
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
    qrWrap: {
        marginLeft: 10,
    },
    actionText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    msgCtn: {
        marginLeft: 10,
        flex: 1,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 17,
        color: 'white',
    },
    subtext: {
        fontSize: 13,
        color: '#aaa',
    },
    image: {
        width: 55,
        height: 55,
    },
    inviteBtn: {
        backgroundColor: 'green',
        color: 'white',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        fontSize: 14,
        marginRight: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#cbd5c0',
        fontSize: 16,
    },
});
