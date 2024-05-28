import { createContext, useEffect, useReducer, useState } from "react";
import type { FC, ReactNode } from "react";
import PropTypes from "prop-types";
import {
  auth,
  signIn,
  createUser,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePasswordFn
} from "../lib/firebase";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { isUserPermissionActions } from "src/slices/userPermissionSlice";
import { useDispatch } from "react-redux";

interface State {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: any | null;
}

interface AuthContextValue extends State {
  platform: "Firebase";
  createUserWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<any>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<any>;
  logout: () => Promise<void>;
  authToken: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

type AuthStateChangedAction = {
  type: "AUTH_STATE_CHANGED";
  payload: {
    isAuthenticated: boolean;
    user: any | null;
  };
};

type Action = AuthStateChangedAction;

const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const reducer = (state: State, action: Action): State => {
  if (action.type === "AUTH_STATE_CHANGED") {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  }

  return state;
};

export const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  platform: "Firebase",
  createUserWithEmailAndPassword: () => Promise.resolve(),
  signInWithEmailAndPassword: () => Promise.resolve(),
  updatePassword: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  authToken: "",
});

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const [authToken, setAuthToken] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setAuthToken(idToken);

        dispatch({
          type: "AUTH_STATE_CHANGED",
          payload: {
            isAuthenticated: true,
            user: user,
          },
        });
      } else {
        setAuthToken("");
        router.push("/");
        dispatch({
          type: "AUTH_STATE_CHANGED",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, setAuthToken]);

  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<any> => {
    try {
      const userCredential = await signIn(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();
      setAuthToken(token);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/profile`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.isSuperUser && data.roles.length === 0) {
        toast.error(
          "You do not have any permissions. Please contact the administration."
        );
        router.push(`/${data.organization.name}/permissionDenied`);
      } else if (!data.isSuperUser) {
        toast.success(`Welcome, ${data.organization.name} user!`);
        router.push(`/${data.organization.name}/shipOfInterest`);
      } else {
        toast.success("Superuser logged in!");
        router.push("/administration/organization");
      }

      const expirationTime = user.metadata?.lastSignInTime;
      console.log("New Token Expiration Time:", expirationTime);
      return userCredential;
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.code === "auth/invalid-login-credentials") {
        toast.error("Incorrect email or password. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }

      throw error;
    }
  };

  const createUserWithEmailAndPassword = async (
    email: string,
    password: string
  ): Promise<any> => createUser(auth, email, password);

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const updatePassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("No user is currently authenticated.");
      }

      const credential = EmailAuthProvider.credential(
        user.email || "",
        oldPassword
      );

      await reauthenticateWithCredential(user, credential);

      await updatePasswordFn(user, newPassword);

      toast.success("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/invalid-login-credentials") {
        toast.error("Incorrect old password. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: "Firebase",
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        logout,
        updatePassword,
        authToken: authToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AuthConsumer = AuthContext.Consumer;
