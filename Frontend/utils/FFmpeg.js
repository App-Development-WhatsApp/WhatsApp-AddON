// utils/ffmpegSegment.js
import * as FileSystem from 'expo-file-system';
import { FFmpegKit } from 'ffmpeg-kit-react-native';

export const segmentVideo = async (file) => {
  try {
    const outputDir = FileSystem.documentDirectory + "segments/";
    await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

    const outputPattern = `${outputDir}${file.name}_segment_%03d.mp4`;
    const ffmpegCommand = `-i "${file.uri}" -c copy -map 0 -segment_time 5 -f segment "${outputPattern}"`;

    const session = await FFmpegKit.execute(ffmpegCommand);
    const returnCode = await session.getReturnCode();

    if (returnCode.isValueSuccess()) {
      // List files in outputDir
      const files = await FileSystem.readDirectoryAsync(outputDir);
      const segments = files
        .filter(f => f.startsWith(file.name))
        .map(f => outputDir + f);

      return segments;
    } else {
      return [];
    }
  } catch (err) {
    console.error("Segmenting error:", err);
    return [];
  }
};
