import React, { useEffect, useState } from "react";
import delegateAbi from "../../../abi/eips/Delegatecall";
import { chainData } from "../../../utils/scaffold-eth/networks";
import { createPublicClient, custom, encodeFunctionData } from "viem";
import { useNetwork } from "wagmi";

interface DataDisplayProps {
  returnData: {
    simulated: string;
    executedHash: string;
  };
  displayError: (errorMessage: string) => void;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ returnData, displayError }) => {
  // Get current chain info
  const { chain } = useNetwork();
  // Store X value
  const [xValue, setXValue] = useState(0);

  // Views value of X inside Delegatecall contract
  const getXValue = async () => {
    if (!window.ethereum) {
      console.log("Window.ethereum is undefined!");
      displayError("Window.ethereum is undefined!");
      return;
    }
    const publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    if (publicClient == undefined) {
      displayError("publicClient is undefined!");
      return;
    }
    const callData = encodeFunctionData({
      abi: delegateAbi,
      functionName: "x",
    });
    if (!chain || !chain?.id) {
      displayError("Chain is undefined!");
      return;
    }
    const contract = chainData[chain?.id]?.delegatecall?.main;
    if (!contract) {
      displayError("Delegatecall contract is undefined, try another chain!");
      return;
    }
    console.log("to:", contract);
    const value = await publicClient.call({
      data: callData,
      to: contract,
    });

    if (!value?.data) {
      displayError("X value is undefined!");
      return;
    }
    console.log("x value:", value);
    console.log("value number:", parseInt(value?.data.toString()));
    setXValue(parseInt(value.data));
  };

  // Function to handle copying transaction hash to clipboard
  const copyHash = () => {
    navigator.clipboard
      .writeText(returnData.executedHash)
      .then(() => {
        console.log("Transaction Hash copied to clipboard!");
      })
      .catch(error => {
        console.error("Failed to copy transaction hash to clipboard: ", error);
      });
  };

  // Code for viewing Delegatecall's `x` value
  useEffect(() => {
    // console.log("chain:", chain.id);
    // console.log("Delegatecall adress:", chainData[chain.id].delegatecall.main);
    if (!chain) {
      return;
    }
    getXValue();
  }, [chain, returnData.executedHash]);

  return (
    <>
      {" "}
      <div className="mb-4 text-center text-2xl flex justify-center gap-4">
        <div>{`Current X value: ${xValue}`}</div>
        {returnData.simulated !== "" && <div>{`Simulated value: ${returnData.simulated}`}</div>}
      </div>
      {returnData.executedHash !== "" && (
        <div className="mb-4 text-center text-gray-400 text-2xl">
          <button
            className="hover:text-gray-500"
            disabled={returnData.executedHash === "Loading..."}
            title={returnData.executedHash === "Loading..." ? undefined : "Click to copy!"}
            onClick={copyHash}
          >
            {returnData.executedHash == "Loading..." ? returnData.executedHash : `Tx hash: ${returnData.executedHash}`}
          </button>
        </div>
      )}
    </>
  );
};

export default DataDisplay;
