import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CallHistory } from '../../lib/data';

export default function History() {
    const route = useRoute();
    const { UserId, name } = route.params;
    
    const userCalls = CallHistory.filter(call => call.UserId === UserId);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Call History - {name}</Text>
            <FlatList
                data={userCalls}
                renderItem={({ item }) => (
                    <View style={styles.historyItem}>
                        {item.datetime.map((entry, index) => (
                            <View key={index} style={styles.entry}>
                                <Text style={styles.text}>{entry.date} - {entry.time} ({entry.status})</Text>
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
    container: { flex: 1, padding: 20, backgroundColor: '#011513' },
    header: { fontSize: 22, color: 'white', marginBottom: 10 },
    historyItem: { padding: 10, borderBottomWidth: 1, borderColor: 'gray' },
    text: { color: 'white' },
});
