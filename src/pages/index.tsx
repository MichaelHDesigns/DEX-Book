import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Dex-Book</title>
        <meta
          name="description"
          content="Solana Dex-Book"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
