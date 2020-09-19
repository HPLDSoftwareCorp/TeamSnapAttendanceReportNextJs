import loadTeamSnap from "./loadTeamSnap";

const loadMe = async () => {
  const teamsnap = await loadTeamSnap();
  if (!teamsnap.collections) return null;
  return teamsnap.loadMe();
};

export default loadMe;
