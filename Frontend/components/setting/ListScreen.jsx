import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// List Screen Component
export default function ListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Title Bar */}
      <View style={styles.titleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lists</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Icons & Description */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>📋 💚 🎁 ➕</Text>
        </View>
        <Text style={styles.description}>
          Any list you create becomes a filter at the top of your Chats tab.
        </Text>

        {/* Create Custom List Button */}
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create a custom list</Text>
        </TouchableOpacity>

        {/* Lists Section */}
        <Text style={styles.sectionTitle}>Your lists</Text>
        <ListItem title="Unread" subText="Preset" />
        <ListItem title="Favourites" subText="Add people or groups" />
        <ListItem title="Groups" subText="Preset" />

        {/* Available Presets */}
        <Text style={styles.sectionTitle}>Available presets</Text>
        <Text style={styles.availablePresetsText}>
          If you remove a preset list like Unread or Groups, it will become available here.
        </Text>
      </ScrollView>
    </View>
  );
}

// Reusable List Item Component
const ListItem = ({ title, subText }) => (
  <View style={styles.listItem}>
    <View style={styles.textContainer}>
      <Text style={styles.listTitle}>{title}</Text>
      <Text style={styles.listSubText}>{subText}</Text>
    </View>
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#1C1C1C',
  },
  backButton: {
    paddingRight: 15,
  },
  backText: {
    fontSize: 30,
    color: 'white',
  },
  title: {
    paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    paddingHorizontal: 15,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#166d3b',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  textContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    color: 'white',
  },
  listSubText: {
    fontSize: 13,
    color: '#888',
  },
  availablePresetsText: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },
});
