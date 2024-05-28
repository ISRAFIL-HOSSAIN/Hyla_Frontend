// AuthGuard.tsx

import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useAuth } from '../../hooks/use-auth';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: FC<AuthGuardProps> = (props) => {
  const { children } = props;
  const auth = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!router.isReady) {
        return;
      }

      if (!auth.isAuthenticated) {
        router.push({
          pathname: '/',
          query: { returnUrl: router.asPath },
        });
      } else {
        try {
          const idTokenResult = await auth.user.getIdTokenResult();

          console.log(idTokenResult.expirationTime, "idTokenResult");

          if (idTokenResult && idTokenResult.expirationTime) {
            const expirationTimestamp = Date.parse(idTokenResult.expirationTime);

            if (expirationTimestamp < Date.now()) {
              console.log('Token expired. Redirecting to login page...');
              router.push('/');
            } else {
              setChecked(true);

              const remainingTime = expirationTimestamp - Date.now();

              setTimeout(() => {
                console.log('Authentication time expired. Redirecting to login page...');
                router.push('/');
              }, remainingTime);
            }
          } else {
            console.error('Invalid idTokenResult or expirationTime');
          }
        } catch (error) {
          if (error.response && error.response.data.message === 'Token has expired') {
            console.log('Token expired. Redirecting to login page...');
            router.push('/');
          } else {
            console.error('Error checking authentication:', error);
          }
        }
      }
    };

    checkAuth();
  }, [router.isReady, auth]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
};








// import type { FC, ReactNode } from 'react';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import PropTypes from 'prop-types';
// import { useAuth } from '../../hooks/use-auth';

// interface AuthGuardProps {
//   children: ReactNode;
// }

// export const AuthGuard: FC<AuthGuardProps> = (props) => {
//   const { children } = props;
//   const auth = useAuth();
//   const router = useRouter();
//   const [checked, setChecked] = useState(false);

//   useEffect(
//     () => {
//       if (!router.isReady) {
//         return;
//       }
//         console.log(auth, "this is auth guard")
//       if (!auth.isAuthenticated) {

//         router.push({
//           pathname: '/',
//           query: { returnUrl: router.asPath }
//         });
//       } else {
//         setChecked(true);
//       }
//     },
//     [router.isReady]
//   );

//   if (!checked) {
//     return null;
//   }

//   return <>{children}</>;
// };

// AuthGuard.propTypes = {
//   children: PropTypes.node
// };
