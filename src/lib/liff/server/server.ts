type LineVerifyResponse = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nonce?: string;
  name?: string;
  picture?: string;
  email?: string;
};

export async function verifyLineIdToken(idToken: string) {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;

  if (!channelId) {
    throw new Error('LINE_LOGIN_CHANNEL_ID is not configured on the server.');
  }

  const body = new URLSearchParams({
    id_token: idToken,
    client_id: channelId,
  });

  const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LINE verify endpoint responded with ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as LineVerifyResponse;

  if (!payload.sub) {
    throw new Error('LINE verify payload did not contain a subject.');
  }

  return payload;
}
