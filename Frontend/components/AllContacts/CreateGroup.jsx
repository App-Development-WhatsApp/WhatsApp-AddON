import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  TextInput, StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { loadUserInfo } from '../../utils/chatStorage';
import { getAllUsers } from '../../utils/AuthServices';
import { saveGroup } from '../../utils/groupStorage'; // Save locally
import { useNavigation } from '@react-navigation/native';

export default function CreateGroupScreen() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const res = await getAllUsers();
      if (res.success) {
        const currentUser = await loadUserInfo();
        const filteredUsers = res.users.filter(u => u._id !== currentUser._id);
        setUsers(filteredUsers);
      }
    })();
  }, []);

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets?.[0] || result;
      setGroupImage(asset.uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert('Group name is required');

    const group = {
      id: Date.now().toString(),
      name: groupName,
      image: groupImage,
      members: selected.map(u => u._id),
      createdAt: new Date().toISOString()
    };

    await saveGroup(group);
    alert('Group created and saved locally');
    navigation.goBack(); // or navigate to the group chat screen
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleSelect(item)} style={styles.userItem}>
      <Image
        source={item.profilePic ? { uri: item.profilePic } : require('../../assets/images/blank.jpeg')}
        style={styles.avatar}
      />
      <Text style={styles.name}>{item.username}</Text>
      {selected.find(u => u._id === item._id) && <Text style={styles.check}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.title}>Select participants</Text>
          <FlatList data={users} renderItem={renderUserItem} keyExtractor={item => item._id} />
          <TouchableOpacity
            style={[styles.nextBtn, { opacity: selected.length ? 1 : 0.5 }]}
            onPress={() => selected.length && setStep(2)}
            disabled={!selected.length}
          >
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Group Details</Text>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={groupImage ? { uri: groupImage } : require('../../assets/images/blank.jpeg')}
              style={[styles.avatar, { width: 80, height: 80, alignSelf: 'center', marginBottom: 10 }]}
            />
            <Text style={styles.pickImageText}>Tap to change group image</Text>
          </TouchableOpacity>
          <TextInput
            placeholder="Enter group name"
            placeholderTextColor="#888"
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
          />
          <TouchableOpacity style={styles.nextBtn} onPress={handleCreateGroup}>
            <Text style={styles.nextText}>Create Group</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 10 },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { color: 'white', fontSize: 16, flex: 1 },
  check: { color: 'green', fontSize: 18 },
  nextBtn: {
    backgroundColor: '#007b5f',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  nextText: { color: 'white', fontSize: 16 },
  input: {
    backgroundColor: '#1e1e1e',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    marginVertical: 15,
  },
  pickImageText: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
});
