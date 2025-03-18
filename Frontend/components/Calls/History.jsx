import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CallHistory } from '../../lib/data';

export default function History() {
    const route = useRoute();
    const { UserId, name } = route.params;
    
    const userCalls = CallHistory.filter(call => call.UserId === UserId);
    const userImage = userCalls.length > 0 ? userCalls[0].image : null;

    return (
        <View style={styles.container}>
            {/* User Profile Section */}
            <View style={styles.profileSection}>
                <Image source={userImage} style={styles.profileImage} />
                <Text style={styles.userName}>{name}</Text>
            </View>

            <Text style={styles.header}>Call History</Text>

            <FlatList
                data={userCalls}
                renderItem={({ item }) => (
                    <View style={styles.historyItem}>
                        {item.datetime.map((entry, index) => (
                            <View key={index} style={styles.entry}>
                                <Text style={styles.date}>{entry.date}</Text>
                                <Text style={styles.time}>{entry.time}</Text>
                                <Text style={[styles.status, entry.status === 'incoming' ? styles.incoming : styles.outgoing]}>
                                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
                keyExtractor={item => item.id}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#011513',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#0a2a2d',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        borderWidth: 2,
        borderColor: 'rgb(95, 252, 123)',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    header: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 2,
        borderColor: 'rgb(95, 252, 123)',
        paddingBottom: 5,
    },
    historyItem: {
        padding: 12,
        backgroundColor: '#0a2a2d',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    entry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#1f3b3e',
    },
    date: {
        color: '#cbd5c0',
        fontSize: 16,
        flex: 2,
    },
    time: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    incoming: {
        color: 'rgb(95, 252, 123)',
    },
    outgoing: {
        color: '#ffcc00',
    },
});
