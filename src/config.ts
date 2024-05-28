export const amplifyConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_AWS_PROJECT_REGION,
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID
};

export const auth0Config = {
  client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN
};

// export const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// };

// hyal dev

// export const firebaseConfig = {
//   apiKey: "AIzaSyDYlGLRsv0fOHy8p-kITEi2NriGegoRQxM",
//   appId: "1:498553442562:web:079ab130077510486cb21b",
//   authDomain: "hyla-dev-85ebd.firebaseapp.com",
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
//   messagingSenderId: "498553442562",
//   projectId: "hyla-dev-85ebd",
//   storageBucket: "hyla-dev-85ebd.appspot.com"
// };

// staging

// export const firebaseConfig = {
//   apiKey: "AIzaSyBUh-13-YrqY3wZ98jTioJE74Rv8JY-Y_U",
//   appId: "1:854096925397:web:abbe63028a151e079a885c",
//   authDomain: "hyla-staging.firebaseapp.com",
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
//   messagingSenderId: "854096925397",
//   projectId: "hyla-staging",
//   storageBucket: "hyla-staging.appspot.com"
// };

// production

export const firebaseConfig = {
  apiKey: "AIzaSyByE4QuWyIxGdGgptfn7nnrNw6hWaL_pG8",
  appId: "1:757847592218:web:4c5fd1f6e4764f526a30a3",
  authDomain: "hyla-prod.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  messagingSenderId: "757847592218",
  projectId: "hyla-prod",
  storageBucket: "hyla-prod.appspot.com"
};


export const gtmConfig = {
  containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID
};
