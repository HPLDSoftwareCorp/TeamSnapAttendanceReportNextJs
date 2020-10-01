import loadTeamSnap from "./loadTeamSnap";

const checkForSession = async () => {
  const teamsnap = await loadTeamSnap();
  return teamsnap.hasSession();
};

export default checkForSession;
