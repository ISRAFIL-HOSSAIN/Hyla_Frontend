import { useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { MainLayout } from '../components/main-layout';
import { gtm } from '../lib/gtm';
import Login from './authentication/login';

const Home: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  return (
    <>
      <Head>
        <title>
          Material Kit Pro
        </title>
      </Head>
      <main>
        <Login/>
      </main>
    </>
  );
};

Home.getLayout = (page) => (
  <MainLayout>
    {page}
  </MainLayout>
);

export default Home;
