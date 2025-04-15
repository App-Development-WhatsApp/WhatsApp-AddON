import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export const getVideoDuration = (filePath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err:Error, metadata:any) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });
  };



  // Function to split video into chunks of 20s
export const splitVideo = (filePath: string, segmentLength = 20): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join("temp_chunks", path.basename(filePath, path.extname(filePath)));
    fs.mkdirSync(outputDir, { recursive: true });

    ffmpeg(filePath)
      .output(path.join(outputDir, 'chunk_%03d.mp4'))
      .outputOptions([
        `-c copy`,
        `-map 0`,
        `-segment_time ${segmentLength}`,
        `-f segment`
      ])
      .on('end', async () => {
        const chunkFiles = fs.readdirSync(outputDir).map(file => path.join(outputDir, file));
        resolve(chunkFiles);
      })
      .on('error', reject)
      .run();
  });
};