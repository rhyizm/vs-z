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

type LineAccessTokenVerifyResponse = {
  client_id: string;
  expires_in: number;
  scope?: string;
};

type LineProfileResponse = {
  userId: string;
  displayName?: string;
  pictureUrl?: string;
  statusMessage?: string;
};

export class LineTokenVerificationError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail: string,
  ) {
    super(message);
    this.name = 'LineTokenVerificationError';
  }
}

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
 * LINEのアクセストークンを検証する非同期関数
 * @param accessToken - 検証するアクセストークン文字列
 * @throws 検証に失敗した場合にエラーをスロー
 * @returns 検証結果の情報を含むPromise
 */
export async function verifyLineAccessToken(accessToken: string) {
  if (!accessToken || !accessToken.trim()) {
    throw new Error('LINE access token is required.');
  }

  const trimmed = accessToken.trim();

  const channelId = getLineChannelId();
  const url = new URL('https://api.line.me/oauth2/v2.1/verify');
  url.searchParams.set('access_token', trimmed);

  if (channelId) {
    url.searchParams.set('client_id', channelId);
  }

  const response = await fetch(url);

  if (!response.ok) {
    const detail = await response.text();
    throw new LineTokenVerificationError(
      `LINE access token verify endpoint responded with ${response.status}: ${detail}`,
      response.status,
      detail,
    );
  }

  const payload = (await response.json()) as LineAccessTokenVerifyResponse;

  if (channelId && payload.client_id !== channelId) {
    throw new Error('LINE access token is not issued for this channel.');
  }

  return payload;
}

/**
 * アクセストークンを使ってLINEプロフィールを取得する非同期関数
 * @param accessToken - プロフィール取得に利用するアクセストークン
 * @throws プロフィール取得に失敗した場合にエラーをスロー
 * @returns LINEプロフィール情報を含むPromise
 */
export async function fetchLineProfileWithAccessToken(accessToken: string) {
  if (!accessToken || !accessToken.trim()) {
    throw new Error('LINE access token is required.');
  }

  const trimmed = accessToken.trim();

  const response = await fetch('https://api.line.me/v2/profile', {
    headers: {
      Authorization: `Bearer ${trimmed}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LINE profile endpoint responded with ${response.status}: ${detail}`);
  }

  const profile = (await response.json()) as LineProfileResponse;

  if (!profile.userId) {
    throw new Error('LINE profile response did not contain a userId.');
  }

  return profile;
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

  if (!idToken || !idToken.trim()) {
    throw new Error('LINE id token is required.');
  }

  const trimmed = idToken.trim();

  const body = new URLSearchParams({
    id_token: trimmed,
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
    throw new LineTokenVerificationError(
      `LINE verify endpoint responded with ${response.status}: ${detail}`,
      response.status,
      detail,
    );
  }

  const payload = (await response.json()) as LineVerifyResponse;

  if (!payload.sub) {
    throw new Error('LINE verify payload did not contain a subject.');
  }

  return payload;
}
