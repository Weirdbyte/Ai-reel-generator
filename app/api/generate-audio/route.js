import { NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { textToMp3 } from '@/lib/tts';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    // Generate audio buffer
    const audioBuffer = await textToMp3(text);

    // Convert buffer → Uint8Array (required)
    const audioUint8 = new Uint8Array(audioBuffer);

    // Firebase storage reference
    const fileRef = ref(
      storage,
      `audio/narration-${Date.now()}.mp3`
    );

    // Upload
    await uploadBytes(fileRef, audioUint8, {
      contentType: 'audio/mpeg',
    });

    // Get public URL
    const downloadUrl = await getDownloadURL(fileRef);

    return NextResponse.json({
      success: true,
      audioUrl: downloadUrl,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}

