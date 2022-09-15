const DAILY_TOKEN = 'somedailytoken';
interface IDailyResponse {
  id: string;
  name: string;
  api_created: boolean;
  privacy: string;
  url: string;
  created_at: string;
  config?: {
    exp?: number;
    start_audio_off?: boolean;
    start_video_off?: boolean;
    max_participants?: boolean;
  };
}
async function createRoom() {
  // generate a random room name
  const roomName = 'daily-room-' + Math.floor(Math.random() * 999999);
  try {
    const response: Response = await fetch('https://api.daily.co/v1/rooms/', {
      method: 'POST',
      ...getApiConfig(),
      body: JSON.stringify({
        name: roomName,
      }),
    });
    const data = await response.json();
    console.log('data', data.url);
  } catch (error: unknown) {
    console.error(error);
  }

  return undefined;
}

function getApiConfig() {
  return {
    headers: {
      Authorization: `Bearer ${DAILY_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
}

export default { createRoom };
