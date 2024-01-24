import React, { ChangeEvent, ChangeEventHandler, FormEvent, useState } from "react";
import nftAbi from "../../../abi/eips/NFT";
import tokenAbi from "../../../abi/eips/Token";
import { chainData } from "../../../utils/scaffold-eth/networks";
import { createPublicClient, createWalletClient, custom, parseEther } from "viem";
import { useNetwork } from "wagmi";

interface TokenReturnDataType {
  nftBalance: number;
  goldBalance: number;
  hash: string;
}

interface DataDisplayProps {
  useWei: boolean;
  setUseWei: React.Dispatch<React.SetStateAction<boolean>>;
  returnData: TokenReturnDataType;
  displayError: (errorMessage: string) => void;
  setReturnData: React.Dispatch<React.SetStateAction<TokenReturnDataType>>;
}

const InputForm: React.FC<DataDisplayProps> = ({ useWei, setUseWei, returnData, setReturnData, displayError }) => {
  // Get current chain info
  const { chain } = useNetwork();

  // Store form input values
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    amount: undefined,
    id: 0,
    function: "mint",
  });

  // Input changing handler functions - Had to split these into two seperate functions to resolve type errors
  // Function to handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Extract the input value from the event
    const { name, value } = e.target;
    console.log("name:", name);
    console.log("value:", value);

    // // Check if the input for x value is a valid integer
    // if (name == "amount" && !/^\d*$/.test(value)) {
    //   console.log(`Invalid input character: ${value} `);
    //   return;
    // }

    // Update the state only if it's a valid integer
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Corrected function signature
  const handleSelectChange: ChangeEventHandler<HTMLSelectElement> = e => {
    // Extract the input value from the event
    const { name, value } = e.target;
    console.log("name:", name);
    console.log("value:", value);

    // Check if the input for x value is a valid integer
    if (name === "input" && !/^\d*$/.test(value)) {
      console.log(`Invalid input character: ${value} `);
      return;
    }

    // Update the state only if it's a valid integer
    setFormData({
      ...formData,
      from: "",
      to: "",
      function: value,
    });
  };

  // Update simulateOnly state value depending on checkbox status
  const handleCheckboxChange = () => {
    // Toggle the state when the checkbox is clicked
    setUseWei(!useWei);
    console.log("useWei value:", useWei);
  };

  // Calls a contract with delegatecall when form is submitted
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Ensure chain and window.ethereum is defined
      if (!chain || !chain?.id) {
        console.log("Chain is undefined!");
        displayError("Chain is undefined!");
        return;
      }
      if (!window.ethereum) {
        console.log("Window.ethereum is undefined!");
        displayError("Window.ethereum is undefined!");
        return;
      }
      // Set up public and wallet clients with Viem
      const publicClient = createPublicClient({
        transport: custom(window.ethereum),
      });
      const walletClient = createWalletClient({
        transport: custom(window.ethereum),
        chain: chain,
      });
      if (!walletClient || !publicClient) {
        console.log("Client is undefined!");
        return;
      }
      const [address] = await walletClient.requestAddresses();

      // Get the Silver and Gold contract addresses from our chainData object
      const nftContract = chainData[chain?.id]?.nft?.main;
      const goldContract = chainData[chain?.id]?.token?.swap;
      if (!nftContract || !goldContract) {
        displayError("Silver or Gold contract is undefined, try another chain!");
        return;
      }

      // Save variable determining which contract address we will call (swap is on Gold/SimpleSwap contract)
      const toAddress = formData.function == "approve" || formData.function == "allowance" ? goldContract : nftContract;
      console.log("contract:", toAddress);

      // If calling the `swap` function, check to ensure the user has approved the Gold contract to take the Silver tokens
      if (formData.function == "buy") {
        const check = await checkAllowance(nftContract, goldContract, address, publicClient);
        console.log("check:", check);
        if (check == false) return;
      }

      // Simulate transactions and get the request
      const request = await getSimulationRequest(toAddress, address, publicClient);
      console.log("Simulaton result:", request);
      if (request === undefined) {
        console.log("Simulation result is undefined!");
      }

      console.log("Writing to contract...");
      const hash = await walletClient.writeContract(request);
      console.log("hash:", hash);

      // Set hash state to loading state
      setReturnData(prevData => ({
        ...prevData,
        hash: "Loading...",
      }));

      const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });
      console.log("tx receipt:", transaction);

      setReturnData(prevData => ({
        ...prevData,
        hash: hash,
      }));
    } catch (error: any) {
      displayError(error);
      setReturnData(prevData => ({
        ...prevData,
        hash: "",
      }));
    }
    console.log("returnData:", returnData);
  };

  // Get result from a simulated transaction
  const getSimulationRequest = async (toAddress: string, address: string, publicClient: any) => {
    // Ensure the function name is valid
    const currentFunction = formData.function as "approve" | "burn" | "transferFrom" | "buy";
    const formattedAmount = useWei ? formData.amount : formData.amount ? parseEther(formData.amount) : formData.amount;
    console.log("currentFunction:", currentFunction);
    console.log("toAddress:", toAddress);
    if (currentFunction == "burn") {
      if (!formData.id) {
        displayError("Token Id is undefined!");
        return 0;
      }
      try {
        const { request } = await publicClient.simulateContract({
          address: toAddress,
          abi: nftAbi,
          args: [BigInt(formData.id)] as readonly [bigint],
          functionName: currentFunction,
          account: address,
        });
        return request;
      } catch (e: any) {
        displayError(e.message);
        return 0;
      }
    } else if (currentFunction == "approve") {
      if (!formData.to || !formattedAmount) {
        displayError("To address or amount is undefined!");
        return 0;
      }
      const { request } = await publicClient.simulateContract({
        address: toAddress,
        abi: tokenAbi,
        args: [formData.to, BigInt(formattedAmount)] as readonly [string, bigint],
        functionName: currentFunction,
        account: address,
      });
      return request;
    } else if (currentFunction == "transferFrom") {
      if (!formData.from || !formData.to || !formData.id) {
        displayError("From/To address or amount is undefined!");
        return 0;
      }
      const { request } = await publicClient.simulateContract({
        address: toAddress,
        abi: nftAbi,
        args: [formData.from, formData.to, BigInt(formData.id)] as readonly [string, string, bigint],
        functionName: currentFunction,
        account: address,
      });
      return request;
    } else if (currentFunction == "buy") {
      const { request } = await publicClient.simulateContract({
        address: toAddress,
        abi: nftAbi,
        functionName: currentFunction,
        account: address,
      });
      console.log("result:", request);
      return request;
    } else {
      return undefined;
    }
  };

  // Gets the NFT contract's allowance to spend the user's funds
  const getAllowance = async (nftContract: string, goldContract: string, address: string, publicClient: any) => {
    if (!goldContract || !address) {
      displayError("One of the allowance input parameters are undefined!");
      return;
    }
    console.log("nftContract:", nftContract);
    console.log("owner addr:", address);
    console.log("gold contract:", goldContract);

    const allowance = await publicClient.readContract({
      address: goldContract,
      abi: tokenAbi,
      functionName: "allowance",
      args: [address, nftContract],
    });
    console.log("allowance:", allowance);
    if (!allowance) {
      return undefined;
    } else {
      return allowance;
    }
  };

  // Checks to ensure NftContract's allowance to spend user tokens is larger than the amount being swapped
  const checkAllowance = async (nftContract: string, goldContract: string, address: string, publicClient: any) => {
    // Ensure the user has approved the Gold/SimpleSwap contract to take the funds
    const allowance = await getAllowance(nftContract, goldContract, address, publicClient);
    console.log("allowance:", allowance);
    const amount = formData.amount;
    console.log("amount:", amount);

    if (!allowance) {
      displayError("Allowance is undefined!");
      return false;
    }
    // console.log("One Token in Wei:", 1e18);
    // console.log("Allowance in Wei:", allowance);
    if (1e18 > parseInt(allowance)) {
      displayError(
        `Must approve Gold/SimpleSwap contract to transferFrom Silver tokens! Allowance: ${parseInt(
          allowance,
        )} Amount: ${1e18}`,
      );
      return false;
    } else {
      return true;
    }
  };

  // Checks to ensure that the submit button should be clickable instead of disabled
  const checkDisabled = () => {
    const currentFunction = formData.function;
    if (currentFunction == "burn") {
      if (!formData.id) {
        return true;
      }
    } else if (currentFunction == "allowance") {
      if (!formData.from || !formData.to) {
        return true;
      }
    } else if (currentFunction == "approve") {
      if (!formData.to || !formData.amount) {
        return true;
      }
    } else if (currentFunction == "transferFrom") {
      if (!formData.from || !formData.to || !formData.id) {
        return true;
      }
    }
    return false;
  };

  // Function to handle displaying the input depending on what function is selected
  const displayInput = () => {
    console.log("func:", formData.function);
    if (formData.function == "transferFrom") {
      return (
        <>
          <input
            type="string"
            name="from"
            placeholder="Address"
            className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/5 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.from}
            onChange={handleInputChange}
          />
          <input
            type="string"
            name="to"
            placeholder="Address"
            className="border p-1.5 mx-2 text-gray-500 focus:ring-0 rounded w-1/5 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.to}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="id"
            step="1"
            placeholder="Token Id"
            className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/5 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.id || ""}
            onChange={handleInputChange}
          />
        </>
      );
    } else if (formData.function == "allowance") {
      return (
        <>
          <input
            type="string"
            name="from"
            placeholder="Address"
            className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.from} // Owner of the funds
            onChange={handleInputChange}
          />
          <input
            type="string"
            name="to"
            placeholder="Address"
            className="border p-1.5 ml-2 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.to} // Spender of the funds
            onChange={handleInputChange}
          />
        </>
      );
    } else if (formData.function == "approve") {
      return (
        <>
          <input
            type="string"
            name="to"
            step="1"
            placeholder="Address"
            className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.to}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="amount"
            step="1"
            placeholder="Amount"
            className="border p-1.5 ml-2 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.amount || ""}
            onChange={handleInputChange}
          />
        </>
      );
    } else if (formData.function == "burn") {
      return (
        <input
          type="number"
          name="id"
          step="1"
          placeholder="Token Id"
          className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
          value={formData.id || ""}
          onChange={handleInputChange}
        />
      );
    }
  };

  return (
    <div className="mb-4 text-center text-xl">
      Input Form
      <form onSubmit={handleSubmit}>
        {/* This input form should display different input boxes depending on which function is selected */}
        {displayInput()}
        <select
          name="function"
          className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300 ml-2"
          value={formData.function}
          onChange={handleSelectChange}
        >
          {/* <option value="transfer">Transfer</option> */}
          <option value="transferFrom">TransferFrom</option>
          <option className="bg-gray-400 text-gray-600" value="approve">
            Approve - ERC-20
          </option>
          <option className="bg-gray-400 text-gray-600" value="allowance">
            Allowance - ERC-20
          </option>
          <option className="bg-gray-500 text-gray-300" value="buy">
            Buy - Non ERC-721
          </option>
          <option className="bg-gray-500 text-gray-300" value="burn">
            Burn - Non ERC-721
          </option>
        </select>
        <div className="flex justify-center gap-2">
          <button
            type="submit"
            disabled={checkDisabled()}
            className="bg-purple-700 border rounded my-2 px-4 py-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-200 text-gray-500 hover:shadow-lg hover:bg-green-300 w-[50%]"
          >
            Execute
          </button>
          {/* Checkbox input */}
          <div className="flex flex-col">
            <input
              className="bg-gray-500 mt-2 toggle"
              type="checkbox"
              id="theme-toggle"
              checked={useWei}
              onChange={handleCheckboxChange}
              title="Toggle between using WEI or ETH"
            />
            {useWei ? "WEI" : "ETH"}
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
