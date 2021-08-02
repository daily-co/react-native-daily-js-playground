const newRoomEndpoint =
  'https://f433xwze36.execute-api.us-west-2.amazonaws.com/default/dailyRnDemoNewCall';

/**
 * Create a short-lived room for demo purposes.
 *
 * IMPORTANT: this is purely a "demo-only" API, and *not* how we recommend
 * you create rooms in real production code. In your code, we recommend that you:
 * - Create rooms by invoking the Daily.co REST API from your own backend server
 *   (or from the Daily.co dashboard if you're OK with creating rooms manually).
 * - Pass an "exp" (expiration) parameter to the Daily.co REST endpoint so you
 *   don't end up with a huge number of live rooms.
 *
 * See https://docs.daily.co/reference#create-room for more information on how
 * to use the Daily.co REST API to create rooms.
 */
async function createRoom(): Promise<{ url: string }> {
  let response = await fetch(newRoomEndpoint);
  return await response.json();

  // Comment out the above and uncomment the below, using your own URL
  // return { url: "https://your-domain.daily.co/hello" };
}

export default { createRoom };
