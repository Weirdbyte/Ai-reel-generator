import textToSpeech from '@google-cloud/text-to-speech';

const client = new textToSpeech.TextToSpeechClient({apiKey: process.env.GOOGLE_TTS_KEY});

export async function textToMp3(text, filePath) {
  const request = {
    input: { text },
    voice: {
      languageCode: 'en-IN',
    //   name: 'en-US-Studio-O'  // male, deep, cinematic (BEST overall)
    //   name: 'en-US-Studio-Q'  // female, warm, ad-quality
    //   name: 'en-US-Neural2-A' // female, clear
    //   name: 'en-US-Neural2-D' // male, professional (BEST Neural2)
    //   name: 'en-US-Neural2-E' // female, expressive
    //   name: 'en-US-Neural2-I' // male, soft tone
    //   name: 'en-IN-Neural2-A' // female
      name: 'en-IN-Neural2-B' // male

    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
  };

  const [response] = await client.synthesizeSpeech(request);

  return response.audioContent;
}
