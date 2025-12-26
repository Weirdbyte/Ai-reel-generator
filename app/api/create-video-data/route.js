import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.video-data');
const DATA_FILE = path.join(DATA_DIR, 'latest.json');

export function saveVideoData(videoData) {
  // 1️⃣ Ensure directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  // 2️⃣ Delete old data if exists
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }

  // 3️⃣ Write fresh data
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(videoData, null, 2),
    'utf-8'
  );
}


export async function POST(req) {
  try {
    const { paragraph } = await req.json();

    if (!paragraph || typeof paragraph !== 'string') {
      return NextResponse.json(
        { error: 'paragraph (string) is required' },
        { status: 400 }
      );
    }


    // Generate scene-wise script (Gemini)

    const scriptRes = await fetch(
      'http://localhost:3000/api/get-video-script',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraph }),
      }
    );

    if (!scriptRes.ok) {
      throw new Error('Failed to generate video script');
    }

    const { scenes } = await scriptRes.json();

    // Generate narration audio (from paragraph)

    const audioRes = await fetch(
      'http://localhost:3000/api/generate-audio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: paragraph }),
      }
    );

    if (!audioRes.ok) {
      throw new Error('Failed to generate audio');
    }

    const { audioUrl } = await audioRes.json();

  
    //Generate ONE image per scene (parallel, order-safe)

    const imageTasks = scenes.map((scene) =>
      fetch('http://localhost:3000/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: scene.imagePrompt }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to generate image');
          }
          return res.json();
        })
        .then(({ imageUrl }) => ({
          contextText: scene.contextText,
          imageUrl,
        }))
    );

    const finalScenes = await Promise.all(imageTasks);

    //  Final in-memory video data

    const videoData = {
      audioUrl,
      scenes: finalScenes,
    };
    saveVideoData(videoData);
    return NextResponse.json(videoData);

  } catch (error) {
    console.error(error); 
    return NextResponse.json(
      { error: 'Failed to create video data' },
      { status: 500 }
    );
  }
}
