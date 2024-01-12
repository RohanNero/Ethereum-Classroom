import React from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div>EIP 170 - Spurious Dragon </div>
    </>
  );
};

export default Home;
