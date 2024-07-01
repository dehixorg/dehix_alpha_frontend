import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const loginUser = async (email:string, password:string) => {
  try {
    const userCredential:UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error:any) {
    // Handle the error here
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
    throw new Error(errorMessage);
  }
};
