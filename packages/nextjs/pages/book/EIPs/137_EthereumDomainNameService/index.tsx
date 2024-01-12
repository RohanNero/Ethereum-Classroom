import React from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div>EIP 137 - Ethereum Domain Name Service </div>
    </>
  );
};

export default Home;
