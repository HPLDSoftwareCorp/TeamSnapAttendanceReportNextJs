import { TeamSnapDivision } from "./TeamSnap";

export default function formatDivisionLabel(division: TeamSnapDivision) {
  return [division.leagueName, division.name].filter(Boolean).join(" - ");
}
