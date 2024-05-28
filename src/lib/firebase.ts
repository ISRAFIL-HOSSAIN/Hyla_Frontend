import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword as signIn,
  createUserWithEmailAndPassword as createUser,
  signOut,
  UserCredential,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword as updatePasswordFn,
} from "firebase/auth";

import { firebaseConfig } from "../config";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {
  app,
  auth,
  signIn,
  createUser,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePasswordFn,
};

// import firebase from "firebase/app";
// import "firebase/messaging";
// import "firebase/auth";
// import "firebase/firestore";
// import { firebaseConfig } from "../config";

// firebase.initializeApp(firebaseConfig);

// export default firebase;
