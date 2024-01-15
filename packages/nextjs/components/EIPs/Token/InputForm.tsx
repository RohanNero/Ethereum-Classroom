import React, { ChangeEvent, ChangeEventHandler, FormEvent, useState } from "react";
import tokenAbi from "../../../abi/eips/Token";
import { chainData } from "../../../utils/scaffold-eth/networks";
import { createPublicClient, createWalletClient, custom, encodeFunctionData } from "viem";
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

const InputForm: React.FC<DataDisplayProps> = ({ returnData, setReturnData, displayError }) => {
  // Get current chain info
  const { chain } = useNetwork();

  // Store form input values
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    amount: undefined,
    function: "mint",
  });

  // Input changing handler functions - Had to split these into two seperate functions to resolve type errors
  // Function to handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Extract the input value from the event
    const { name, value } = e.target;
    console.log("name:", name);
    console.log("value:", value);

    // Check if the input for x value is a valid integer
    if (name == "amount" && !/^\d*$/.test(value)) {
      console.log(`Invalid input character: ${value} `);
      return;
    }

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
      from: "",
      to: "",
      amount: undefined,
      function: value,
    });
  };

  // Checks to ensure that the submit button should be clickable instead of disabled
  const checkDisabled = () => {
    const currentFunction = formData.function;
    if (currentFunction == "mint" || currentFunction == "burn" || currentFunction == "swap") {
      if (!formData.amount) {
        return true;
      }
    } else if (currentFunction == "allowance") {
      if (!formData.from || !formData.to) {
        return true;
      }
    } else if (currentFunction == "transfer" || currentFunction == "approve") {
      if (!formData.to || !formData.amount) {
        return true;
      }
    } else if (currentFunction == "transferFrom") {
      if (!formData.from || !formData.to || !formData.amount) {
        return true;
      }
    }
    return false;
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

      // Ensure client objects were initialized correctly and are defined
      if (!walletClient || !publicClient) {
        console.log("Client is undefined!");
        return;
      }
      // Get the user's addresses
      const [address] = await walletClient.requestAddresses();

      // Get the Silver and Gold contract addresses from our chainData object
      const silverContract = chainData[chain?.id]?.token?.main;
      const goldContract = chainData[chain?.id]?.token?.swap;

      // ENsure contract addresses are defined
      if (!silverContract || !goldContract) {
        displayError("Silver or Gold contract is undefined, try another chain!");
        return;
      }

      // Save variable determining which contract address we will call (swap is on Gold/SimpleSwap contract)
      const toAddress = formData.function == "swap" ? goldContract : silverContract;
      console.log("contract:", toAddress);

      // Encode the function data to be sent
      const callData = getCalldata();
      console.log("callData:", callData);

      // Ensure callData is defined
      if (!callData) {
        displayError("Calldata is undefined!");
        return;
      }

      // If calling the `swap` function, check to ensure the user has approved the Gold contract to take the Silver tokens
      if (formData.function == "swap") {
        const check = await checkAllowance(silverContract, goldContract, address, publicClient);
        console.log("check:", check);
        if (check == false) return;
      }

      // Simulate transactions and get the result
      const result = getSimulationResult(toAddress, address, publicClient);
      console.log("Simulaton result:", result);

      // Ensure simulated transaction result is defined
      if (!result) {
        console.log("Simulation result is undefined!");
      }

      // Send the transaction and get the hash
      const hash = await walletClient.sendTransaction({
        account: address,
        to: toAddress,
        data: callData,
      });
      console.log("hash:", hash);

      // Set hash state to loading state
      setReturnData(prevData => ({
        ...prevData,
        hash: "Loading...",
      }));

      // Wait for transaction to be completed and get the receipt
      const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });
      console.log("tx receipt:", transaction);

      // Set the hash value from our transaction
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
  const getSimulationResult = async (toAddress: string, address: string, publicClient: any) => {
    // Ensure the function name is valid
    const currentFunction = formData.function as "mint" | "approve" | "burn" | "transfer" | "transferFrom" | "swap";

    if (currentFunction == "mint" || currentFunction == "burn" || currentFunction == "swap") {
      if (!formData.amount) {
        displayError("Amount is undefined!");
        return;
      }
      const { result } = await publicClient.simulateContract({
        address: toAddress,
        abi: tokenAbi,
        args: [BigInt(formData.amount)] as readonly [bigint],
        functionName: currentFunction,
        account: address,
      });
      return result;
    } else if (currentFunction == "approve" || currentFunction == "transfer") {
      if (!formData.to || !formData.amount) {
        displayError("To address or amount is undefined!");
        return;
      }
      const { result } = await publicClient.simulateContract({
        address: toAddress,
        abi: tokenAbi,
        args: [formData.to, BigInt(formData.amount)] as readonly [string, bigint],
        functionName: currentFunction,
        account: address,
      });
      return result;
    } else if (currentFunction == "transferFrom") {
      if (!formData.from || !formData.to || !formData.amount) {
        displayError("From/To address or amount is undefined!");
        return;
      }
      const { result } = await publicClient.simulateContract({
        address: toAddress,
        abi: tokenAbi,
        args: [formData.from, formData.to, BigInt(formData.amount)] as readonly [string, string, bigint],
        functionName: currentFunction,
        account: address,
      });
      return result;
    } else {
      return undefined;
    }
  };

  // Get calldata for sending a transaction
  const getCalldata = () => {
    // Ensure the function name is valid
    const currentFunction = formData.function as
      | "mint"
      | "allowance"
      | "approve"
      | "burn"
      | "transfer"
      | "transferFrom"
      | "swap";
    if (currentFunction == "mint" || currentFunction == "burn" || currentFunction == "swap") {
      if (!formData.amount) {
        displayError("Amount is undefined!");
        return;
      }
      console.log("code reached");
      const callData = encodeFunctionData({
        abi: tokenAbi,
        functionName: currentFunction,
        args: [BigInt(formData.amount)] as readonly [bigint],
      });
      return callData;
    } else if (currentFunction == "allowance") {
      if (!formData.from || !formData.to) {
        displayError("From or To address is undefined!");
        return;
      }
      const callData = encodeFunctionData({
        abi: tokenAbi,
        functionName: currentFunction,
        args: [formData.from, formData.to] as readonly [string, string],
      });
      return callData;
    } else if (currentFunction == "approve" || currentFunction == "transfer") {
      if (!formData.to || !formData.amount) {
        displayError("To address or amount is undefined!");
        return;
      }
      const callData = encodeFunctionData({
        abi: tokenAbi,
        functionName: currentFunction,
        args: [formData.to, BigInt(formData.amount)] as readonly [string, bigint],
      });
      return callData;
    } else if (currentFunction == "transferFrom") {
      if (!formData.from || !formData.to || !formData.amount) {
        displayError("From/To address or amount is undefined!");
        return;
      }
      const callData = encodeFunctionData({
        abi: tokenAbi,
        functionName: currentFunction,
        args: [formData.from, formData.to, BigInt(formData.amount)] as readonly [string, string, bigint],
      });
      return callData;
    } else {
      return undefined;
    }
  };

  // Gets the Gold contract's allowance to spend the user's funds
  const getAllowance = async (silverContract: string, goldContract: string, address: string, publicClient: any) => {
    if (!goldContract || !address) {
      displayError("One of the allowance input parameters are undefined!");
      return;
    }

    console.log("owner addr:", address);
    console.log("gold contract:", goldContract);

    // Encode the allowance calldata
    const callData = encodeFunctionData({
      abi: tokenAbi,
      args: [address, goldContract],
      functionName: "allowance",
    });

    // View Silver and Gold total supplies
    const allowance = await publicClient.call({
      data: callData,
      to: silverContract,
    });
    console.log("allowance:", allowance);
    if (!allowance?.data) {
      return undefined;
    } else {
      return allowance.data;
    }
  };

  // Checks to ensure GoldContract's allowance to spend user tokens is larger than the amount being swapped
  const checkAllowance = async (silverContract: string, goldContract: string, address: string, publicClient: any) => {
    // Ensure the user has approved the Gold/SimpleSwap contract to take the funds
    const allowance = await getAllowance(silverContract, goldContract, address, publicClient);
    console.log("allowance:", allowance);
    const amount = formData.amount;
    console.log("amount:", amount);

    if (!amount || !allowance) {
      displayError("Amount or allowance is undefined!");
      return false;
    }

    if (parseInt(amount) > parseInt(allowance)) {
      displayError(
        `Must approve Gold/SimpleSwap contract to transferFrom Silver tokens! Allowance: ${parseInt(
          allowance,
        )} Amount: ${parseInt(amount)}`,
      );
      return false;
    } else {
      return true;
    }
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
            name="amount"
            step="1"
            placeholder="Amount"
            className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/5 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
            value={formData.amount || ""}
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
    } else if (formData.function == "transfer" || formData.function == "approve") {
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
    } else if (formData.function == "mint" || formData.function == "burn" || formData.function == "swap") {
      return (
        <input
          type="number"
          name="amount"
          step="1"
          placeholder="Amount"
          className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
          value={formData.amount || ""}
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
          <option value="approve">Approve</option>
          <option value="allowance">Allowance</option>
          <option value="transfer">Transfer</option>
          <option value="transferFrom">TransferFrom</option>
          <option className="bg-gray-500 text-gray-300" value="mint">
            Mint - Non ERC-20
          </option>
          <option className="bg-gray-500 text-gray-300" value="burn">
            Burn - Non ERC-20
          </option>
          <option className="bg-gray-500 text-gray-300" value="swap">
            Swap - Non ERC-20
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
        </div>
      </form>
    </div>
  );
};

export default InputForm;
