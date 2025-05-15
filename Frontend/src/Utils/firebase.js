import { initializeApp } from "firebase/app";
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import toast from "react-hot-toast";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// ✅ Called when user clicks "Continue with Google"
export async function googleAuth() {
  try {
    if (isMobile) {
      await signInWithRedirect(auth, provider);
      const result = await getRedirectResult(auth);
      if (result) {
        return result.user;
      }
    } else {
      let result = await signInWithPopup(auth, provider);
      return result.user;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    toast.error("Please try again later");
    return null;
  }
}


// ✅ Called on page load after redirect
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
  } catch (error) {
    console.error("Redirect Error:", error);
    toast.error("Authentication failed. Please try again.");
  }
  return null;
}

export { auth };
