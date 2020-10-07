import initFirebaseAdmin from "./initFirebaseAdmin";

export default async function loadOrgLocationNames(org: string) {
  const firebase = initFirebaseAdmin();
  const firestore = firebase.firestore();
  const locations = await firestore.collection(`orgs/${org}/locations`).get();
  return locations.docs.map((doc: any) => doc.get("name"));
}
