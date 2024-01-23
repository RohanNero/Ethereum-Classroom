import React, { useEffect, useState } from "react";
import recoverAbi from "../../../abi/eips/PersonalMessage";
import { chainData } from "../../../utils/scaffold-eth/networks";
import { createPublicClient, createWalletClient, custom, encodeFunctionData, formatEther } from "viem";
import { useNetwork } from "wagmi";

interface ReturnDataType {
  signature: string;
  hash: string;
  hashedMessage: string;
  simulated: string;
}

interface DataDisplayProps {
  returnData: ReturnDataType;
  displayError: (errorMessage: string) => void;
  setReturnData: React.Dispatch<React.SetStateAction<ReturnDataType>>;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ returnData, setReturnData, displayError }) => {
  // Get current chain info
  const { chain } = useNetwork();
  // Store values
  const [values, setValues] = useState({
    knowledge: 0,
    userAddress: "",
  });
  const [currentChain, setCurrentChain] = useState(0);

  // Views user's balance in PatrickCollins contract
  const getValues = async () => {
    if (!window.ethereum) {
      console.log("Window.ethereum is undefined!");
      displayError("Window.ethereum is undefined!");
      return;
    }
    if (!chain || !chain?.id) {
      displayError("Chain is undefined!");
      return;
    }
    const publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: chain,
    });

    if (!walletClient || !publicClient) {
      console.log("Client is undefined!");
      displayError("Client is undefined!");
      return;
    }

    const [address] = await walletClient.requestAddresses();

    console.log("address:", address);
    const callData = encodeFunctionData({
      abi: recoverAbi,
      args: [address],
      functionName: "balanceOf",
    });

    const contract = chainData[chain?.id]?.structuredMessage?.main;
    if (!contract) {
      displayError("EIP 712 contract is undefined, try another chain!");
      return;
    }
    console.log("to:", contract);
    const value = await publicClient.call({
      data: callData,
      to: contract,
    });

    if (!value?.data) {
      console.log("Knowledge balance is undefined!");
      return;
    }
    console.log("knowledge balance:", value);
    console.log("knowledge balance number:", parseInt(value?.data.toString()));
    setValues({ userAddress: address, knowledge: parseInt(value.data) });
    if (currentChain !== chain?.id) {
      setCurrentChain(chain?.id);
      setReturnData({ ...returnData, hash: "" });
    }
    // setReturnData({ ...returnData, signature: undefined });
  };

  // Function to handle copying transaction hash or user address to clipboard (pass "h" for hash, otherwise copy address)
  const copyString = (input: string) => {
    let text = "";
    if (input == "hash") {
      console.log(returnData.hash);
      text = returnData.hash;
    } else if (input == "sig") {
      text = returnData.signature;
    } else if (input == "hashedMessage") {
      text = returnData.hashedMessage;
    } else {
      text = values.userAddress;
    }
    console.log(text, "copied!");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard!");
      })
      .catch(error => {
        console.error("Failed to copy text to clipboard: ", error);
      });
  };

  function truncateMiddle(str: string) {
    const start = str.slice(0, 21);
    const end = str.slice(-21);
    console.log("start and end:", start, end);
    const truncatedString = start + "....." + end;

    return truncatedString;
  }

  // Code for viewing Delegatecall's `x` value
  useEffect(() => {
    // console.log("chain:", chain.id);
    // console.log("Delegatecall adress:", chainData[chain.id].delegatecall.main);
    if (!chain) {
      return;
    }
    getValues();
  }, [chain, returnData.hash]);

  return (
    <>
      {" "}
      <div className="mb-4 text-center text-2xl flex justify-center gap-4 flex-col">
        <div className="text-gray-400">
          <span className="mr-1 text-gray-500">Your address:</span>
          <button
            className="hover:text-gray-500"
            onClick={() => {
              copyString("addr");
            }}
            title="Click to copy!"
          >
            {values.userAddress}
          </button>{" "}
          <span className="ml-2 mr-1 text-gray-500">Knowledge:</span>
          {formatEther(BigInt(values.knowledge))}
        </div>
        <div className="mb-4 text-center text-gray-400 text-2xl overflow-hidden">
          {returnData.signature !== "" && returnData.signature && (
            <>
              <span className="text-gray-500">Signature: </span>
              <button
                title="Click to copy!"
                onClick={() => {
                  copyString("sig");
                }}
              >
                <span className="hover:text-gray-500">{truncateMiddle(returnData.signature)}</span>
              </button>{" "}
            </>
          )}
          {returnData.simulated !== "" && returnData.simulated && (
            <>
              <span className="ml-2 text-gray-500">Simulated Success:</span> {returnData.simulated}
            </>
          )}
        </div>
        <div className="mb-4 text-center text-gray-400 text-2xl overflow-hidden">
          {returnData.hashedMessage !== "" && returnData.hashedMessage && (
            <>
              <span className="text-gray-500">HashedMessage: </span>
              <button
                title="Click to copy!"
                onClick={() => {
                  copyString("hashedMessage");
                }}
              >
                <span className="hover:text-gray-500">{returnData.hashedMessage}</span>
              </button>{" "}
            </>
          )}
        </div>
      </div>
      {returnData.hash !== "" && returnData.hash && (
        <div className="mb-4 text-center text-gray-400 text-2xl">
          <button
            className="hover:text-gray-500"
            disabled={returnData.hash === "Loading..."}
            title={returnData.hash === "Loading..." ? undefined : "Click to copy!"}
            onClick={() => {
              copyString("hash");
            }}
          >
            {returnData.hash == "Loading..." ? (
              returnData.hash
            ) : (
              <>
                <span className="text-gray-500">Tx hash:</span> {returnData.hash}
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default DataDisplay;
