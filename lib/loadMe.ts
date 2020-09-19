import loadTeamSnap from "./loadTeamSnap";

const loadMe = async () => {
  const teamsnap = await loadTeamSnap();
  return teamsnap.loadMe();
}

export default loadMe;
