type GoogleKey = {
  web: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
};

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

let cached: GoogleKey | null = null;

const keyOf = (): GoogleKey => {
  if (!cached) {
    const raw = process.env.GOOGLE_KEY_JSON;
    if (!raw) throw new Error("missing GOOGLE_KEY_JSON");
    cached = JSON.parse(raw) as GoogleKey;
  }
  return cached;
};

const redirectUri = (): string => keyOf().web.redirect_uris[0];

export const googleAuthUrl = (state: string): string => {
  const q = new URLSearchParams({
    client_id: keyOf().web.client_id,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q.toString()}`;
};

const postForm = async (
  url: string,
  body: URLSearchParams,
): Promise<Response> =>
  fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

export const googleExchange = async (code: string): Promise<GoogleProfile> => {
  const k = keyOf();
  const tok = await postForm(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: k.web.client_id,
      client_secret: k.web.client_secret,
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  );
  if (!tok.ok) throw new Error(`google token exchange failed: ${tok.status}`);
  const data = (await tok.json()) as { access_token: string };
  const ui = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${data.access_token}` },
  });
  if (!ui.ok) throw new Error(`google userinfo failed: ${ui.status}`);
  return (await ui.json()) as GoogleProfile;
};
