import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import Cookies from 'js-cookie';

import { initializeAxiosWithToken } from './axiosinstance';

import { auth, googleProvider } from '@/config/firebaseConfig';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sends a password reset email to the specified email address.
 * @param email - The email address to which the password reset email will be sent.
 * @returns A promise that resolves when the email is sent or rejects with an error.
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully.');
  } catch (error: any) {
    // Handle the error here
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
    throw new Error(errorMessage);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential;
  } catch (error: any) {
    // Handle the error here
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
    throw new Error(errorMessage);
  }
};

export const loginGoogleUser = async () => {
  return await signInWithPopup(auth, googleProvider);
};

interface UserClaims {
  [key: string]: any;
}

interface UserJson {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthResult {
  user: UserJson;
  claims: UserClaims;
}

export const getUserData = async (
  userCredential: UserCredential,
): Promise<AuthResult> => {
  try {
    const user = userCredential.user;

    // Get the ID token
    const accessToken = await user.getIdToken();
    // Initialize Axios with the token if needed
    initializeAxiosWithToken(accessToken);

    // Get the token claims
    const tokenResult = await user.getIdTokenResult();
    const claims = tokenResult.claims;

    // Create a plain JSON representation of the user
    const userJson: UserJson = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    const userType = claims.type as string;
    // Storing user type and token in cookies
    Cookies.set('userType', userType, { expires: 1, path: '/' });
    Cookies.set('token', accessToken, { expires: 1, path: '/' });

    // Return the user data and claims as JSON
    return {
      user: userJson,
      claims,
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
