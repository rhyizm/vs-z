/**
 * LINEのIDトークン検証レスポンスの型定義
 */
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

/**
 * チャンネルIDを正規化する関数
 * @param value - チャンネルIDの文字列またはundefined
 * @returns 正規化されたチャンネルID、無効な場合はnull
 */
function normaliseChannelId(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.startsWith('If you want to use LINE Login')) {
    return null;
  }

  return trimmed;
}

/**
 * 環境変数からLINEのチャンネルIDを取得する関数
 * @returns 設定されたチャンネルID、存在しない場合はnull
 */
export function getLineChannelId() {
  const configuredChannelId = normaliseChannelId(process.env.LINE_LOGIN_CHANNEL_ID);
  const fallbackChannelId = normaliseChannelId(process.env.NEXT_PUBLIC_LINE_CHANNEL_ID);

  return configuredChannelId ?? fallbackChannelId;
}

/**
 * LINEのIDトークンを検証する非同期関数
 * @param idToken - 検証するIDトークン文字列
 * @throws チャンネルIDが設定されていない場合や検証に失敗した場合にエラーをスロー
 * @returns 検証結果のペイロード情報を含むPromise
 */
export async function verifyLineIdToken(idToken: string) {
  const channelId = getLineChannelId();

  if (!channelId) {
    throw new Error(
      'LINE channel ID is not configured on the server. Set LINE_LOGIN_CHANNEL_ID or NEXT_PUBLIC_LINE_CHANNEL_ID.',
    );
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
    body: body.toString(),
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
