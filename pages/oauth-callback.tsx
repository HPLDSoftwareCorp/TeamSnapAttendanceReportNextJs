import React from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import exchangeCodeForToken, {
  OAuthTokenData,
} from "../lib/server/teamsnap/exchangeCodeForToken";

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context.req.url, context.query, context.params);
  if (context.query.code) {
    const data = await exchangeCodeForToken(
      context.query.code as string,
      `https://${context.req.headers.host}/oauth-callback`
    );
    return { props: data };
  }
  return { props: {} };
};

export default function OAuthCallback({ access_token }: OAuthTokenData) {
  const router = useRouter();
  const stateArgs = new URLSearchParams(router.query.state as string);
  const returnUrl = stateArgs.get("returnUrl") || router.query.returnUrl || "/";
  if (process.browser && access_token) {
    sessionStorage["teamsnap.authToken"] = access_token;
    window.location.href = returnUrl as string;
  }
  return <div>Logging in...</div>;
}
