import { TeamSnapTeam } from "./TeamSnap";

export default function formatTeamLabel(team: TeamSnapTeam) {
  return [team.leagueName, team.name].filter(Boolean).join(" - ");
}
