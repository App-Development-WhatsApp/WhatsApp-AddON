import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList
} from 'react-native';
import CallsHeader from './CallsHeader';
import { Ionicons, Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { CallHistory } from '../../lib/data';
import { useNavigation } from '@react-navigation/native';

// Group calls by user and keep only the latest
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

const Item = ({ id, name, image, datetime, type, status, missed, UserId }) => {
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
                  <View style={styles.userDetail}>
                      <Text style={styles.name}>{name}</Text>
                      <View style={styles.statusCtn}>
                          <MaterialCommunityIcons 
                              name={status === 'incoming' ? "arrow-bottom-left" : "arrow-top-right"} 
                              size={24} 
                              color={missed ? '#ba0c2f' : "rgb(95, 252, 123)"} 
                          />
                          <Text style={styles.textSub}>{datetime.slice(-1)[0].time}</Text>
                      </View>
                  </View>
                  {type === 'call' ? <Ionicons name="call-outline" size={24} color="rgb(95, 252, 123)" /> : <Feather name="video" size={24} color="rgb(95, 252, 123)" />}
              </View>
          </View>
      </TouchableOpacity>
  );
};

export default function Calls() {
  return (
      <View style={styles.container}>
          <CallsHeader />
          <ScrollView contentInsetAdjustmentBehavior="automatic">
              <FlatList
                  data={getLatestCalls()}
                  renderItem={({ item }) => <Item {...item} />}
                  keyExtractor={item => item.id}
                  style={styles.FlatlistStyle}
              />
          </ScrollView>
      </View>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#011513',
    },
    iconCtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        backgroundColor: 'rgb(95, 252, 123)',
        borderRadius: 50,
    },
    textCtn: {
        flexDirection: 'column',
    },
    FlatlistStyle: {
      marginTop: 30
    },
    linkCtn: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    textSub: {
        color: '#cbd5c0'
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
    statusCtn: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center'
    },
    touch: {
      backgroundColor: 'red',
    },
    msgCtn: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
    },
    userDetail: {
    //   gap: 1,
    },
    name: {
      fontWeight: 'bold',
      fontSize: 20,
      color: 'white',
    },
    message: {
      fontSize: 12,
      color: 'white',
    },
    image: {
        width: 55,
        height: 55,
    },
    newCall: {
        backgroundColor: 'rgb(95, 252, 123)',
        width: 50,
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
    touchable: {
      borderRadius: 10,
      padding: 5,
    },
    touchablePressed: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light highlight effect
    },
});