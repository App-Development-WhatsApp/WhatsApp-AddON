import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { ChannelFollowed } from '../../lib/data';
import { Entypo } from '@expo/vector-icons';

export default function Channels() {

  const Item = ({ name, image, message, datetime }) => (
    <TouchableOpacity activeOpacity={0.6}>
      <View style={styles.channelCtn}>
        <Image style={styles.image} source={image} borderRadius={50} resizeMode='cover' />
        <View style={styles.msgCtn}>
          <View style={styles.userDetail}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <Text style={styles.time}>{datetime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleCtn}>
        <Text style={styles.title}>Channels</Text>
        <Entypo style={styles.title_btn} name="plus" size={24} color="#cbd5c0" />
      </View>

      <ScrollView contentInsetAdjustmentBehavior="automatic" horizontal={false} contentContainerStyle={styles.channelsCtn} showsHorizontalScrollIndicator={false}>
        <FlatList
          data={ChannelFollowed}
          renderItem={({ item }) => <Item name={item.name} image={item.image} message={item.message} datetime={item.datetime} />}
          keyExtractor={item => item.id}
          horizontal={false}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#121212',
    paddingLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202020',
  },
  titleCtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title_btn:{
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
    marginBottom: 15,
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
  },
  channelsCtn: {
    paddingBottom: 25,
  },
  channelCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  msgCtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginLeft: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
    paddingBottom: 10,
  },
  userDetail: {
    flexShrink: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ffffff',
  },
  message: {
    fontSize: 14,
    color: '#aaaaaa',
    marginTop: 3,
  },
  time: {
    fontSize: 12,
    color: '#00ff00',
  },
});