import React, { useEffect } from "react";
import tokenAbi from "../../../abi/eips/Token";
import { chainData } from "../../../utils/scaffold-eth/networks";
import { createPublicClient, createWalletClient, custom, encodeFunctionData, formatEther } from "viem";
import { useNetwork } from "wagmi";

interface TokenReturnDataType {
  silverBalance: number;
  silverSupply: number;
  goldBalance: number;
  goldSupply: number;
  hash: string;
}

interface DataDisplayProps {
  returnData: TokenReturnDataType;
  displayError: (errorMessage: string) => void;
  setReturnData: React.Dispatch<React.SetStateAction<TokenReturnDataType>>;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ returnData, setReturnData, displayError }) => {
  // Get current chain info
  const { chain } = useNetwork();

  // Views balance of user's Silver and Gold tokens
  const getTokenBalances = async () => {
    if (!window || !window?.ethereum) {
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
    const walletClient = createWalletClient({
      transport: custom(window.ethereum),
      chain: chain,
    });

    if (!walletClient || !publicClient) {
      console.log("Client is undefined!");
      return;
    }
    const accounts = await walletClient.getAddresses();
    console.log("accounts:", accounts[0]);

    // Construct calldata object for balanceOf and totalSupply
    const callData = encodeFunctionData({
      abi: tokenAbi,
      args: [accounts[0]],
      functionName: "balanceOf",
    });
    const totalSupplyCallData = encodeFunctionData({
      abi: tokenAbi,
      functionName: "totalSupply",
    });

    if (!chain || !chain?.id) {
      displayError("Chain is undefined!");
      return;
    }
    const silverContract = chainData[chain?.id]?.token?.main;
    const goldContract = chainData[chain?.id]?.token?.swap;
    if (!silverContract || !goldContract) {
      displayError("Silver or Gold contract is undefined, try another chain!");
      return;
    }
    console.log("Silver contract:", silverContract);
    console.log("Gold contract:", goldContract);

    // View Silver and Gold balances
    const silverBalance = await publicClient.call({
      data: callData,
      to: silverContract,
    });
    const goldBalance = await publicClient.call({
      data: callData,
      to: goldContract,
    });
    if (!silverBalance?.data || !goldBalance?.data) {
      displayError("Silver or Gold balance is undefined!");
      setReturnData({
        ...returnData,
        silverBalance: 0,
        goldBalance: 0,
      });
      return;
    }

    console.log("Silver balance:", parseInt(silverBalance.data.toString()));
    console.log("Gold balance:", parseInt(goldBalance.data.toString()));

    // View Silver and Gold total supplies
    const silverSupply = await publicClient.call({
      data: totalSupplyCallData,
      to: silverContract,
    });
    const goldSupply = await publicClient.call({
      data: totalSupplyCallData,
      to: goldContract,
    });
    if (!silverSupply?.data || !goldSupply?.data) {
      displayError("Silver or Gold supply is undefined!");
      setReturnData({
        ...returnData,
        silverSupply: 0,
        goldSupply: 0,
      });
      return;
    }
    console.log("silver supply:", parseInt(silverSupply.data.toString()));
    console.log("gold supply:", parseInt(goldSupply.data.toString()));

    setReturnData(prevData => ({
      ...prevData,
      silverBalance: parseInt(silverBalance.data ?? "0") || 0,
      goldBalance: parseInt(goldBalance.data ?? "0") || 0,
      silverSupply: parseInt(silverSupply.data ?? "0") || 0,
      goldSupply: parseInt(goldSupply.data ?? "0") || 0,
    }));
  };

  // Function to handle copying transaction hash or contract address to clipboard
  const copyHexString = (txHash: boolean) => {
    if (!chain || !chain?.id) {
      displayError("Chain is undefined!");
      return;
    }
    let copyText = "";
    if (txHash) {
      copyText = returnData.hash;
    } else {
      copyText = chainData[chain?.id]?.token?.swap || "";
    }
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        console.log("Transaction Hash copied to clipboard!");
      })
      .catch(error => {
        console.error("Failed to copy transaction hash to clipboard: ", error);
      });
  };

  // Code for viewing Silver and Gold balances
  useEffect(() => {
    // console.log("chain:", chain.id);
    if (!chain) {
      return;
    }
    getTokenBalances();
  }, [chain, returnData.hash]);

  return (
    <>
      {" "}
      <div className="mb-4 text-center text-2xl flex justify-center gap-4">
        <div className="text-gray-400">
          {" "}
          <span className="text-gray-500">Silver balance: </span>
          {formatEther(BigInt(returnData.silverBalance))}
        </div>
        <div className="text-gray-400">
          {" "}
          <span className="text-gray-500">Total supply: </span>
          {formatEther(BigInt(returnData.silverSupply))}
        </div>
        <div className="text-gray-400">
          {" "}
          <span className="text-gray-500">Gold balance: </span>
          {formatEther(BigInt(returnData.goldBalance))}
        </div>
        <div className="text-gray-400">
          <span className="text-gray-500">Total supply: </span>
          {formatEther(BigInt(returnData.goldSupply))}
        </div>
      </div>
      {chain && chain?.id && (
        <div className="mb-4 text-center text-gray-400 text-2xl">
          <span className="text-gray-500 mr-1">SimpleSwap contract:</span>
          <button className="hover:text-gray-500" title="Click to copy!" onClick={() => copyHexString(false)}>
            {chainData[chain?.id]?.token?.swap}
          </button>
        </div>
      )}
      {returnData.hash !== "" && (
        <div className="mb-4 text-center text-gray-400 text-2xl">
          <button
            className="hover:text-gray-500"
            disabled={returnData.hash === "Loading..."}
            title={returnData.hash === "Loading..." ? undefined : "Click to copy!"}
            onClick={() => copyHexString(true)}
          >
            {returnData.hash === "Loading..." ? (
              returnData.hash
            ) : (
              <>
                <span className="text-gray-500">Tx hash:</span> {returnData.hash}
              </>
            )}
          </button>
        </div>
      )}{" "}
    </>
  );
};

export default DataDisplay;
