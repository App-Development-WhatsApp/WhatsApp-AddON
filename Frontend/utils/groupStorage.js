import * as FileSystem from 'expo-file-system';

const GROUP_FILE_URI = FileSystem.documentDirectory + 'groups.json';

// Load groups from local file
export const loadGroups = async () => {
  try {
    const data = await FileSystem.readAsStringAsync(GROUP_FILE_URI);
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

// Save new group to file
export const saveGroup = async (newGroup) => {
  const existingGroups = await loadGroups();
  const updatedGroups = [...existingGroups, newGroup];
  await FileSystem.writeAsStringAsync(GROUP_FILE_URI, JSON.stringify(updatedGroups));
};
