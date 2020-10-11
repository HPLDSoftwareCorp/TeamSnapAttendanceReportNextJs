import axios from "axios";
import initFirebaseWebApp from "./initFirebaseWebApp";
import memoize from "lodash/memoize";
import firebaseLogout from "./firebaseLogout";

export default memoize(
  async function firebaseLogin(org: string) {
    try {
      if (!process.browser) {
        return null;
      }
      const authToken = sessionStorage["teamsnap.authToken"];

      const firebase = initFirebaseWebApp();

      if (!authToken) {
        if (firebase.auth().currentUser) {
          // If we logged out of TeamSnap, also log out of firebase
          await firebaseLogout();
        }
        return null;
      }

      // Also note this user's usage in firestore
      const resp = await axios.post("/api/login", { authToken, org });
      const { firebaseAuthToken } = resp.data;
      await firebase.auth().signInWithCustomToken(firebaseAuthToken);
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  (org) => [org, process.browser && sessionStorage["teamsnap.authToken"]].join()
);
