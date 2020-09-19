import loadTeamSnap from "./loadTeamSnap";

const doLogin = async () => {
  const teamsnap = await loadTeamSnap();

  await teamsnap.startBrowserAuth(
    location.protocol === "http:"
      ? "urn:ietf:wg:oauth:2.0:oob"
      : ["https://", location.hostname, "/oauth-callback"].join(""),
    ["read"]
  );
};

export default doLogin;
