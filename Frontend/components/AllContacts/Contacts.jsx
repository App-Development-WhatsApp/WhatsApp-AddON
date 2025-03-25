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
import { useNavigation } from '@react-navigation/native';
// import { Users } from '../../lib/data';
import Header from '../Chats/Header';
import Search from '../Chats/Search';
import { getAllUsers } from '../../Services/AuthServices';

export default function Contacts() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [Users, setUsers] = useState([]);
    useEffect(() => {
        const getUsers = async () => {
            setLoading(true)
            try {
                const res = await getAllUsers()
                // console.log(res.user)
                setUsers(res.user);
                setLoading(false)
            } catch (err) {
                console.log(err)
                setLoading(false)
            }
        }
        getUsers()
    }, [])

    const Item = ({ id, name, image }) => (
        <View>
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => navigation.navigate('Chatting', { userId: id, name, image })}
            >
                <View style={styles.userCtn}>
                    <Image
                        style={styles.image}
                        source={image ?{
                            uri: image
                        } : require('../../assets/images/blank.jpeg')}
                        borderRadius={50}
                        resizeMode="cover"
                        onError={(e) => console.log("Image Load Err:", e.nativeEvent.error)}
                    />

                    <View style={styles.msgCtn}>
                        <View style={styles.userDetail}>
                            <Text style={styles.name}>{name}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );


    return (
        <View style={styles.container}>
            {loading ? (
                // Show Loading Spinner
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text style={styles.loadingText}>Fetching profile...</Text>
                </View>
            ) : (
                <ScrollView contentInsetAdjustmentBehavior="automatic">
                    <Header />
                    <View style={styles.chatCtn}>
                        <FlatList
                            data={Users}
                            renderItem={({ item }) =>
                                <Item key={item._id}  id={item._id} name={item.username} image={item.profilePic} />
                            }
                            keyExtractor={item => item.id}
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
    userDetail: {
        gap: 5,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
    },
    message: {
        fontSize: 13,
        color: '#cbd5c0'
    },
    image: {
        width: 55,
        height: 55,
    },
    newUpdate: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        gap: 20,
        alignItems: 'center',
    },
    pen: {
        borderRadius: 10,
        backgroundColor: '#233040',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    msg: {
        borderRadius: 15,
        backgroundColor: 'rgb(95, 252, 123)',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
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
