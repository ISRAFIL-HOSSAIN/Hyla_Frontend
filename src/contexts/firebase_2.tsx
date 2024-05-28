// import { createContext, useEffect, useReducer, useRef, useState } from "react";
// import type { FC, ReactNode } from "react";
// import PropTypes from "prop-types";
// import firebase from "../lib/firebase";
// import type { User } from "../types/user";
// import { useRouter } from "next/router";
// import { toast } from "react-hot-toast";
// import { isUserPermissionActions } from "src/slices/userPermissionSlice";
// import { useDispatch } from "react-redux";
// import { SplashScreen } from "src/components/splash-screen";
// interface State {
//   isInitialized: boolean;
//   isAuthenticated: boolean;
//   user: User | null;
// }

// interface AuthContextValue extends State {
//   platform: "Firebase";
//   createUserWithEmailAndPassword: (
//     email: string,
//     password: string
//   ) => Promise<any>;
//   signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
//   logout: () => Promise<void>;
//   authToken: string;
// }

// interface AuthProviderProps {
//   children: ReactNode;
// }

// type AuthStateChangedAction = {
//   type: "AUTH_STATE_CHANGED";
//   payload: {
//     isAuthenticated: boolean;
//     user: User | null;
//   };
// };

// type Action = AuthStateChangedAction;

// const initialState: State = {
//   isAuthenticated: false,
//   isInitialized: false,
//   user: null,
// };

// const reducer = (state: State, action: Action): State => {
//   if (action.type === "AUTH_STATE_CHANGED") {
//     const { isAuthenticated, user } = action.payload;
//     return {
//       ...state,
//       isAuthenticated,
//       isInitialized: true,
//       user,
//     };
//   }

//   return state;
// };

// export const AuthContext = createContext<AuthContextValue>({
//   ...initialState,
//   platform: "Firebase",
//   createUserWithEmailAndPassword: () => Promise.resolve(),
//   signInWithEmailAndPassword: () => Promise.resolve(),
//   logout: () => Promise.resolve(),
//   authToken: "",
// });

// export const AuthProvider: FC<AuthProviderProps> = (props) => {
//   const { children } = props;
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const [authToken, setAuthToken] = useState<string>("");
//   const router = useRouter();
//   const [isTokenExpired, setIsTokenExpired] = useState(false);
//   const [isLoading, setIsLoading] = useState(true); // Add loading state
//   const isMounted = useRef(true);

//   useEffect(() => {
//     isMounted.current = true;

//     const initializeFirebase = async () => {
//       // Set Firebase Auth Persistence
//       await firebase
//         .auth()
//         .setPersistence(firebase.auth.Auth.Persistence.LOCAL);

//       const user = firebase.auth().currentUser;

//       if (user) {
//         try {
//           const idToken = await user.getIdToken();

//           if (!isMounted.current) {
//             return;
//           }

//           setAuthToken(idToken);

//           dispatch({
//             type: "AUTH_STATE_CHANGED",
//             payload: {
//               isAuthenticated: true,
//               user: {
//                 id: user.uid,
//                 email: user.email,
//               },
//             },
//           });

//           setIsLoading(false); // Set loading state to false

//           // No need to handle token expiration here
//         } catch (error) {
//           console.log("Error getting ID token:", error);

//           if (error.code === "auth/id-token-expired") {
//             console.log("Session expired. Setting token expiration flag...");
//             setIsTokenExpired(true);
//           } else {
//             dispatch({
//               type: "AUTH_STATE_CHANGED",
//               payload: {
//                 isAuthenticated: false,
//                 user: null,
//               },
//             });

//             console.error("Unknown error:", error);
//             setIsLoading(false); // Set loading state to false
//           }
//         }
//       } else {
//         // User is not logged in
//         console.log("User logged out");
//         setAuthToken("");
//         if (isMounted.current && isTokenExpired) {
//           console.log("Token expired. Redirecting to login page.");
//           handleTokenExpired();
//           setAuthToken("");
//           setIsTokenExpired(false);
//         }

//         dispatch({
//           type: "AUTH_STATE_CHANGED",
//           payload: {
//             isAuthenticated: false,
//             user: null,
//           },
//         });

//         setIsLoading(false); // Set loading state to false
//       }
//     };

//     const unsubscribe = firebase.auth().onIdTokenChanged(initializeFirebase);

//     initializeFirebase();

//     return () => {
//       // Set isMounted to false when the component is unmounted
//       isMounted.current = false;
//       unsubscribe();
//     };
//   }, [dispatch, setAuthToken, isTokenExpired, router]);

//   const handleTokenExpired = () => {
//     toast.error("Token expired. Redirecting to login page.");
//     const returnUrl = (router.query.returnUrl as string) || "/";
//     router.push(returnUrl);
//   };

//   const signInWithEmailAndPassword = async (
//     email: string,
//     password: string
//   ): Promise<any> => {
//     try {
//       const userCredential = await firebase
//         .auth()
//         .signInWithEmailAndPassword(email, password);
//       const user = userCredential.user;
//       const token = await user.getIdToken();
//       setAuthToken(token);
//       localStorage.setItem("accessToken", token);

//       const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}users/profile`;

//       const response = await fetch(apiUrl, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch user data: ${response.statusText}`);
//       }

//       const data = await response.json();

//       if (!data.isSuperUser && data.roles.length === 0) {
//         toast.error(
//           "You do not have any permissions. Please contact the administration."
//         );
//         const returnUrl =
//           (router.query.returnUrl as string) ||
//           `/${data.organization.name}/permissionDenied`;
//         router.push(returnUrl);
//       } else if (!data.isSuperUser) {
//         toast.success(`Welcome, ${data.organization.name} user!`);
//         const returnUrl =
//           (router.query.returnUrl as string) ||
//           `/${data.organization.name}/users`;
//         router.push(returnUrl);
//       } else {
//         toast.success("Superuser logged in!");
//         const returnUrl =
//           (router.query.returnUrl as string) || "/administration/organization";
//         router.push(returnUrl);
//       }

//       const expirationTime = user.metadata?.lastSignInTime;
//       console.log("New Token Expiration Time:", expirationTime);

//       return userCredential;
//     } catch (error) {
//       // Handle Firebase authentication errors
//       if (error.message) {
//         const errorMessage = JSON.parse(error.message);
//         if (error.code === "auth/id-token-expired") {
//           console.log("Session expired. Setting token expiration flag...");
//           setIsTokenExpired(true);
//         } else {
//           console.error("Unknown error:", error);

//           // Redirect even in case of an error
//           handleTokenExpired();
//           setAuthToken("");
//           setIsTokenExpired(false);
//         }
//       } else {
//         // Handle non-Firebase errors
//         toast.error("An unexpected error occurred. Please try again.");
//         console.error("Error signing in:", error);
//       }
//       throw error;
//     }
//   };

//   const createUserWithEmailAndPassword = async (
//     email: string,
//     password: string
//   ): Promise<any> =>
//     firebase.auth().createUserWithEmailAndPassword(email, password);

//   const logout = async (): Promise<void> => {
//     await firebase.auth().signOut();
//     const returnUrl = (router.query.returnUrl as string) || "/";
//     router.push(returnUrl);
//     toast.error("logout.");
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         ...state,
//         platform: "Firebase",
//         createUserWithEmailAndPassword,
//         signInWithEmailAndPassword,
//         logout,
//         authToken: authToken,
//       }}
//     >
//       {isLoading ? <SplashScreen /> : children}
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export const AuthConsumer = AuthContext.Consumer;
