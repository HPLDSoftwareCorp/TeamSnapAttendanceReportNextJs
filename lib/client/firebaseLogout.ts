import initFirebaseWebApp from "./initFirebaseWebApp";

export default function firebaseLogout() {
  const firebase = initFirebaseWebApp();
  return firebase.auth().signOut();
}
