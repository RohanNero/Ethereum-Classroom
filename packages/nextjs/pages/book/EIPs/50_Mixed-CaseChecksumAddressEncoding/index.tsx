import React from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div>EIP 50 - Mixed-Case Checksum Address Encoding </div>
    </>
  );
};

export default Home;
