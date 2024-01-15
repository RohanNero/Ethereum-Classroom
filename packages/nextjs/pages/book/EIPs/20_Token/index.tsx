import React, { useState } from "react";
import type { NextPage } from "next";
import DataDisplay from "~~/components/EIPs/Token/DataDisplay";
import ExtraCodeBlocks from "~~/components/EIPs/Token/ExtraCodeBlocks";
import InputForm from "~~/components/EIPs/Token/InputForm";
import Text from "~~/components/EIPs/Token/Text";
import Error from "~~/components/Error";

const Home: NextPage = () => {
  // Token balances and tx hash
  const [returnData, setReturnData] = useState({
    silverBalance: 0,
    silverSupply: 0,
    goldBalance: 0,
    goldSupply: 0,
    hash: "",
  });

  // Handle the state of tx interaction, if false the transaction will actually be submitted
  const [useWei, setUseWei] = useState<boolean>(true);

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
      <div className="flex-col mx-auto max-w-screen-xl p-4 font-fantasy text-gray-500">
        <Text />
        <DataDisplay displayError={displayError} returnData={returnData} setReturnData={setReturnData} />
        <InputForm
          useWei={useWei}
          setUseWei={setUseWei}
          displayError={displayError}
          returnData={returnData}
          setReturnData={setReturnData}
        />
        <ExtraCodeBlocks />
        {/* Conditionally render the custom error popup */}
        {showErrorPopup && <Error errorMessage={errorMessage} onClose={closeError} />}
      </div>
    </>
  );
};

export default Home;
