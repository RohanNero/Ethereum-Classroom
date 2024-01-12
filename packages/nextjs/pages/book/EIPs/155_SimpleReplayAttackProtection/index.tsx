import React from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div>EIP 155 - Simple Replay Attack Protection </div>
    </>
  );
};

export default Home;
