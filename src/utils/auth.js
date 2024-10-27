import { auth } from '../firebase/firebase.js';

export function isAuthenticated() {
  const user = auth.currentUser;
  return user !== null;
}
