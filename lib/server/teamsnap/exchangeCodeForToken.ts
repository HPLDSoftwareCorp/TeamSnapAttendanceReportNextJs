import axios from "axios";

export interface OAuthTokenData {
  access_token: string;
  token_type: string;
  scope: string;
  created_at: number;
}
export default async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<OAuthTokenData> {
  const data = {
    client_id: process.env.NEXT_PUBLIC_TEAMSNAP_CLIENT_ID,
    client_secret: process.env.TEAMSNAP_CLIENT_SECRET,
    redirect_uri: redirectUri,
    code,
    grant_type: "authorization_code",
  };
  const resp = await axios.post("https://auth.teamsnap.com/oauth/token", data);
  return resp.data;
}
