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
import { ChannelData } from '../../lib/data';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FindChannels() {

  const Item = ({ name, image, followers }) => (
    <View style={styles.channelItem}>
      <View style={styles.channelCtn}>
        <Image style={styles.image} source={image} borderRadius={50} resizeMode='cover' />
        <View style={styles.textCtn}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.followers}>{followers} followers</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.followBtn} activeOpacity={0.7}>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find channels to follow</Text>
      <FlatList
        data={ChannelData}
        renderItem={({ item }) => <Item name={item.name} image={item.image} followers={item.followers} />}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
      <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.7}>
        <Text style={styles.exploreText}>Explore more</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#121212',
    borderRadius: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B0B0B0',
    marginBottom: 15,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  channelCtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 12,
  },
  textCtn: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  followers: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  followBtn: {
    backgroundColor: 'rgb(95, 252, 123)',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  followText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exploreBtn: {
    marginTop: 15,
    backgroundColor: 'rgba(95, 252, 123, 0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  exploreText: {
    color: 'rgb(95, 252, 123)',
    fontSize: 15,
    fontWeight: 'bold',
  },
});