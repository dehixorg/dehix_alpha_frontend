export const dynamic = "force-dynamic"; // static by default, unless reading the request
export const runtime = "edge";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../config/firebaseConfig";
export async function POST(req: Request) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };
    // Ensure username and password are provided
    if (!username || !password) {
      Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
      return;
    }

    // Sign in with username and password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      username,
      password
    );

    // Return user data on successful login
    return Response.json(userCredential.user, { status: 200 });
  } catch (error:any) {
    // Return error response on login failure
    return Response.json({ error: error.message }, { status: 400 });
  }
}
