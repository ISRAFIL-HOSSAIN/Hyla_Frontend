// import { createContext, useEffect, useReducer, useState } from "react";
// import type { FC, ReactNode } from "react";
// import PropTypes from "prop-types";
// import firebase from "../lib/firebase";
// import type { User } from "../types/user";
// import { useRouter } from "next/router";
// import { toast } from "react-hot-toast";

// import { isUserPermissionActions } from "src/slices/userPermissionSlice";
// import { useDispatch } from "react-redux";
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
  

//   // useEffect(() => {
//   //   const unsubscribe = firebase.auth().onIdTokenChanged(async (user) => {
//   //     console.log(user, "login user");
//   //     if (user) {
//   //       try {
//   //         const idToken = await user.getIdToken();
//   //         setAuthToken(idToken);
         
//   //         dispatch({
//   //           type: "AUTH_STATE_CHANGED",
//   //           payload: {
//   //             isAuthenticated: true,
//   //             user: {
//   //               id: user.uid,
//   //               email: user.email,
//   //             },
//   //           },
//   //         });
//   //       } catch (error) {

//   //         dispatch({
//   //           type: "AUTH_STATE_CHANGED",
//   //           payload: {
//   //             isAuthenticated: false,
//   //             user: null,
//   //           },
//   //         });
        
//   //         console.log(user, "expire user");
//   //         console.log(error, "error");
//   //         if (error.code === "auth/id-token-expired") {
//   //           console.log("Session expired. Please log in again.");
//   //           handleSessionExpired();
//   //         } else {
//   //           console.error("Error getting ID token:", error.message);
//   //           handleTokenExpired();
//   //         }
//   //       }
//   //     } else {
//   //       console.log("user logout");
//   //       setAuthToken("");
//   //       router.push("/");
//   //       dispatch({
//   //         type: "AUTH_STATE_CHANGED",
//   //         payload: {
//   //           isAuthenticated: false,
//   //           user: null,
//   //         },
//   //       });
//   //     }
//   //   });

//   //   return () => {
//   //     unsubscribe();
//   //   };
//   // }, [dispatch, setAuthToken]);


//   useEffect(() => {
//     const unsubscribe = firebase.auth().onIdTokenChanged(async (user) => {
//       console.log(user, "login user");
  
//       if (user) {
//         try {
//           const idToken = await user.getIdToken();
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
//         } catch (error) {
//           console.log(user, "expire user");
//           console.error("Error getting ID token:", error);
  
//           if (error.code === "auth/id-token-expired") {
//             console.log("Session expired. Refreshing token...");
  
//             try {
//               const refreshedToken = await user.getIdToken(true);
//               console.log("New Token Expiry Time:", user.metadata?.lastSignInTime);
//               setAuthToken(refreshedToken);
//               localStorage.setItem('accessToken', refreshedToken);
//             } catch (refreshError) {
//               console.error("Error refreshing token:", refreshError);
//               handleTokenExpired();
//             }
//           } else {
//             dispatch({
//               type: "AUTH_STATE_CHANGED",
//               payload: {
//                 isAuthenticated: false,
//                 user: null,
//               },
//             });
  
//             console.error("Unknown error:", error);
//           }
//         }
//       } else {
//         console.log("user logout");
//         setAuthToken("");
//         router.push("/");
//         dispatch({
//           type: "AUTH_STATE_CHANGED",
//           payload: {
//             isAuthenticated: false,
//             user: null,
//           },
//         });
//       }
//     });
  
//     return () => {
//       unsubscribe();
//     };
//   }, [dispatch, setAuthToken]);
  


  

//   const handleTokenExpired = () => {
//     toast.error("Token expired. Redirecting to login page.");
//     router.push("/");
//   };

//   const handleSessionExpired = () => {
//     toast.error("Session expired. Please log in again.");
//     router.push("/");
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
//       localStorage.setItem('accessToken', token);

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
//         router.push(`/${data.organization.name}/permissionDenied`);
//       } else if (!data.isSuperUser) {
//         toast.success(`Welcome, ${data.organization.name} user!`);
//         router.push(`/${data.organization.name}/users`);
//       } else {
//         toast.success("Superuser logged in!");
//         router.push("/administration/organization");
//       }

//       const expirationTime = user.metadata?.lastSignInTime;
//       console.log("New Token Expiration Time:", expirationTime);

//       return userCredential;
//     } catch (error) {
//       // Handle Firebase authentication errors
//       if (error.message) {
//         const errorMessage = JSON.parse(error.message);
//         if (errorMessage && errorMessage.error && errorMessage.error.message) {
//           const firebaseErrorCode = errorMessage.error.message;
//           toast.error(firebaseErrorCode);
//         } else {
//           toast.error("An unexpected error occurred. Please try again.");
//           console.error("Error signing in:", error);
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
//       {children}
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export const AuthConsumer = AuthContext.Consumer;
