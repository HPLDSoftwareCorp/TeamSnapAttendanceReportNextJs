import loadTeamSnap from "./loadTeamSnap";

const doLogin = async () => {
  const teamsnap = await loadTeamSnap();

  await teamsnap.startBrowserAuth(
    location.protocol === "http:"
      ? "urn:ietf:wg:oauth:2.0:oob"
      : [location.protocol, "//", location.host, "/oauth-callback"].join(""),
    ["read"]
  );
};

export default doLogin;
