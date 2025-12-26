import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const FREEPIK_CREATE_URL = 'https://api.freepik.com/v1/ai/mystic';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt (string) is required' },
        { status: 400 }
      );
    }

    // Create Freepik image generation task
    const createRes = await fetch(FREEPIK_CREATE_URL, {
      method: 'POST',
      headers: {
        'x-freepik-api-key': process.env.FREEPIK_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        resolution: '2k',
        aspect_ratio: 'social_story_9_16',
        model: 'realism',
        engine: 'automatic',
        filter_nsfw: true,
      }),
    });

    const createData = await createRes.json();
    console.log('FREEPIK CREATE:', createData);

    const taskId = createData?.data?.task_id;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Failed to create Freepik task' },
        { status: 500 }
      );
    }

    //Poll Freepik until image is ready
    let imageUrl = null;

    for (let i = 0; i < 15; i++) {
      await sleep(3000);

      const statusRes = await fetch(
        `https://api.freepik.com/v1/ai/mystic/${taskId}`,
        {
          headers: {
            'x-freepik-api-key': process.env.FREEPIK_API_KEY,
          },
        }
      );

      const statusData = await statusRes.json();
    //   console.log('FREEPIK STATUS:', statusData);

      if (
        statusData?.data?.status === 'COMPLETED' &&
        statusData?.data?.generated?.length
      ) {
        imageUrl = statusData.data.generated[0];
        break;
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image generation timed out' },

        { status: 500 }
      );
    }

    //  Download image from Freepik CDN
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();

    // Upload to Firebase Storage
    const fileName = `images/scene-${Date.now()}.png`;
    const fileRef = ref(storage, fileName);

    await uploadBytes(fileRef, new Uint8Array(imgBuffer), {
      contentType: 'image/png',
    });

    const firebaseUrl = await getDownloadURL(fileRef);

    //Final response
    return NextResponse.json({
      success: true,
      imageUrl: firebaseUrl,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
