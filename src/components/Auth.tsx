'use client'

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";

const provider = new GoogleAuthProvider();

const SignInWithGoogle = () => {
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
     
      // The signed-in user info.
      const user = result.user;
      console.log(user);
      // You can use the credential.accessToken here if needed
    } catch (error: unknown) {
      console.error('Error signing in with Google', error);
      setError(error instanceof Error ? error.message : 'An error occurred during sign in');
    }
  };

  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default SignInWithGoogle;

