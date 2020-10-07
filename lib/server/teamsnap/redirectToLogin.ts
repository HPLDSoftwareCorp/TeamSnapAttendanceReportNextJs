import { IncomingMessage, ServerResponse } from "http";

export default function redirectToLogin(
  req: IncomingMessage,
  res: ServerResponse,
  returnUrl: string = `https://${req.headers.host}/${req.url}`
) {
  const authUrl = new URL("https://auth.teamsnap.com/oauth/authorize");
  authUrl.searchParams.set(
    "client_id",
    process.env.NEXT_PUBLIC_TEAMSNAP_CLIENT_ID
  );
  authUrl.searchParams.set(
    "redirect_uri",
    `https://${req.headers.host}/oauth-callback`
  );
  authUrl.searchParams.set("response_type", "code");
  const stateParams = new URLSearchParams({ returnUrl });
  authUrl.searchParams.set("state", stateParams.toString());
  res.setHeader("location", authUrl.toString());
  res.statusCode = 302;
  res.end();
}
