import React, { useState } from "react";
import type { NextPage } from "next";
import DataDisplay from "~~/components/EIPs/Delegatecall/DataDisplay";
import ExtraCodeBlocks from "~~/components/EIPs/Delegatecall/ExtraCodeBlocks";
import InputForm from "~~/components/EIPs/Delegatecall/InputForm";
import Text from "~~/components/EIPs/Delegatecall/Text";
import Error from "~~/components/Error";

const Home: NextPage = () => {
  // Simulated tx X value and executed tx hash
  const [returnData, setReturnData] = useState({
    simulated: "",
    executedHash: "",
  });
  // State variable for storing error messages
  const [errorMessage, setErrorMessage] = useState("");

  // State variable for showing/hiding the error popup
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Function to handle closing the error
  const closeError = () => {
    setShowErrorPopup(false);
    // Clear the error message
    setErrorMessage("");
  };

  // Function to handle displaying the error
  const displayError = (errorMessage: string): void => {
    const duration = 10000;
    setErrorMessage(errorMessage);
    setShowErrorPopup(true);
    // Reset error useState values to default after duration milliseconds
    setTimeout(closeError, duration);
  };

  return (
    <>
      {/* <MetaHeader /> */}
      <div className="flex-col mx-auto max-w-screen-xl p-4 font-fantasy text-gray-500">
        <Text />
        <DataDisplay displayError={displayError} returnData={returnData} />
        <InputForm displayError={displayError} returnData={returnData} setReturnData={setReturnData} />
        {/* Conditionally render the custom error popup */}
        {showErrorPopup && <Error errorMessage={errorMessage} onClose={closeError} />}
        <ExtraCodeBlocks />
      </div>
    </>
  );
};

export default Home;
