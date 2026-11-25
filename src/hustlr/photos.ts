import * as ImagePicker from 'expo-image-picker';

/** Opens the photo library and returns the picked image's local URI, or null if cancelled. */
export async function pickPhoto(): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (res.canceled) return null;
  return res.assets[0]?.uri ?? null;
}
