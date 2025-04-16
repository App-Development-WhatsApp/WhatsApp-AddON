import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    FlatList
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CallHistory } from '../../lib/data';
import { useNavigation } from '@react-navigation/native';
import Menu from '../Menu/Menu';

const getLatestCalls = () => {
    const uniqueCalls = {};
    CallHistory.forEach(call => {
        const userId = call.UserId;
        if (!uniqueCalls[userId] ||
            new Date(call.datetime.slice(-1)[0].date + " " + call.datetime.slice(-1)[0].time) >
            new Date(uniqueCalls[userId].datetime.slice(-1)[0].date + " " + uniqueCalls[userId].datetime.slice(-1)[0].time)
        ) {
            uniqueCalls[userId] = call;
        }
    });
    return Object.values(uniqueCalls);
};

const CallsHeader = () => (
    <View style={styles.headerCtn}>
        <Text style={styles.logo}>Calls</Text>
        <View style={styles.iconCtn}>
            <Feather name="search" size={24} color="white" />
            <Menu />
        </View>
    </View>
);

const Item = ({ id, name, image, datetime, status, missed, UserId }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            style={styles.touchable}
            onPress={() => navigation.navigate('History', { UserId, name })}
        >
            <View style={styles.userCtn}>
                <Image style={styles.image} source={image} borderRadius={50} resizeMode='cover' />
                <View style={styles.msgCtn}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.statusCtn}>
                        <MaterialCommunityIcons
                            name={status === 'incoming' ? "arrow-bottom-left" : "arrow-top-right"}
                            size={15}
                            color={missed ? '#ba0c2f' : "rgb(95, 252, 123)"}
                        />
                        <Text style={styles.textSub}>{datetime.slice(-1)[0].time}</Text>
                    </View>
                </View>
                <Ionicons name="call-outline" size={20} color="rgb(95, 252, 123)" />
            </View>
        </TouchableOpacity>
    );
};

const FavoriteItem = ({ name, image }) => (
    <View style={styles.favoriteItem}>
        <Image style={styles.favoriteImage} source={image} borderRadius={50} resizeMode='cover' />
        <Text style={styles.favoriteName}>{name}</Text>
    </View>
);

export default function Calls() {
    return (
        <View style={styles.container}>
            <CallsHeader />
            <ScrollView>
                <View style={styles.favoritesContainer}>
                    <Text style={styles.sectionTitle}>Favorites</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FavoriteItem name="Sahil" image={require('../../assets/images/samuel.jpg')} />
                        <FavoriteItem name="Sajal" image={require('../../assets/images/tomi.png')} />
                    </ScrollView>
                </View>
                <FlatList
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    data={getLatestCalls()}
                    renderItem={({ item,index }) => <Item key={index} {...item} />}
                    keyExtractor={item => item.id}
                    style={styles.FlatlistStyle}
                />
            </ScrollView>
            <TouchableOpacity style={styles.newCall}>
                <Ionicons name="call" size={30} color="black" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    logo: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
    },
    headerCtn: {
        paddingTop: StatusBar.currentHeight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#2a373a',
    },
    iconCtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    FlatlistStyle: {
        marginTop: 5,
    },
    textSub: {
        color: '#889b9f',
        fontSize: 13,
    },
    userCtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    statusCtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    msgCtn: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'white',
    },
    image: {
        width: 45,
        height: 45,
        borderRadius: 50,
        marginRight: 10
    },
    touchable: {
        borderRadius: 10,
        paddingVertical: 5,
    },
    newCall: {
        backgroundColor: 'rgb(95, 252, 123)',
        width: 55,
        height: 55,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    favoritesContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#202020',
    },
    sectionTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    favoriteItem: {
        alignItems: 'center',
        marginRight: 15,
    },
    favoriteImage: {
        width: 55,
        height: 55,
        borderRadius: 50,
    },
    favoriteName: {
        color: 'white',
        marginTop: 5,
        fontSize: 14,
    },
});