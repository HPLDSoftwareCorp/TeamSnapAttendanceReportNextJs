import { TeamSnapDivision } from "./TeamSnap";

export default function formatDivisionLabel(division: TeamSnapDivision) {
  return [
    division.leagueName,
    division.parentDivisionName,
    division.name,
    division.seasonName,
  ]
    .filter(Boolean)
    .join(" - ");
}
