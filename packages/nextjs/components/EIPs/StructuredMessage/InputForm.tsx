import React, { ChangeEvent, FormEvent, useState } from "react";
import structuredMessageAbi from "../../../abi/eips/StructuredMessage";
import { chainData } from "../../../utils/scaffold-eth/networks";
import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  /* hashTypedData, */
  parseEther,
} from "viem";
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

const InputForm: React.FC<DataDisplayProps> = ({ displayError, returnData, setReturnData }) => {
  // Get current chain info
  const { chain } = useNetwork();

  const [formData, setFormData] = useState({
    message: "",
    signature: "",
    function: "sign",
    amount: "",
    address: "",
    hashedMessage: "",
  });

  // Handle the state of tx interaction, if false the transaction will actually be submitted
  const [simulateOnly, setSimulateOnly] = useState<boolean>(true);

  // Function to handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Extract the input value from the event
    const { name, value } = e.target;

    // Update the state
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name == "function" && value == "sign") {
      setSimulateOnly(true);
      setReturnData({ ...returnData, simulated: "" });
    }
  };

  // Update simulateOnly state value depending on checkbox status
  const handleCheckboxChange = () => {
    // Toggle the state when the checkbox is clicked
    setSimulateOnly(!simulateOnly);
    console.log("simulate value:", simulateOnly);
  };

  // Handles logic around signing the message
  const handleSignFunction = async (walletClient: any, address: string, contract: string) => {
    if (!chain?.id) {
      displayError("Chain Id is undefined!");
      return;
    }

    try {
      // All properties on a domain are optional
      const domain = {
        name: "Ethereum Classroom",
        version: "1",
        chainId: chain?.id,
        verifyingContract: contract,
      };

      // The named list of all type definitions
      const types = {
        Info: [
          { name: "student", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "patricksFavAnimal", type: "string" },
        ],
      };

      // const hash = await hashTypedData({
      //   domain,
      //   types,
      //   primaryType: "Info",
      //   message: {
      //     student: formData.address,
      //     amount: parseEther(formData.amount),
      //     patricksFavAnimal: formData.message,
      //   },
      // });
      // console.log("typeHash:", hash);

      const signature = await walletClient.signTypedData({
        account: address,
        domain,
        types,
        primaryType: "Info",
        message: {
          student: formData.address,
          amount: parseEther(formData.amount),
          patricksFavAnimal: formData.message,
        },
      });
      setReturnData({ ...returnData, hashedMessage: "", simulated: "", signature: signature });
      console.log("signature:", signature);
      console.log("returnData object:", returnData);
    } catch (e: any) {
      displayError(e.message);
      return;
    }
  };

  // Handles logic around sending `recover()` transaction call
  const handleRecoverFunction = async (walletClient: any, publicClient: any, address: string, contract: string) => {
    // If function is recover make the function call
    setReturnData({
      ...returnData,
      simulated: "",
    });

    // Simulate `delegate` tx
    const result = await getSimulationResult(contract, address, publicClient);
    if (!result) {
      displayError("Simulation result is undefined!");
      return;
    }
    console.log("result:", result.toString());

    setReturnData(prevData => ({
      ...prevData,
      simulated: result.toString(),
    }));

    // If simulateOnly is false, execute the transaction
    if (simulateOnly == false) {
      // Call `recover`
      try {
        setReturnData({ ...returnData, simulated: "", hash: "Loading..." });

        // Get the calldata to be sent to the transaction
        const callData = await getCalldata();
        console.log("calldata:", callData);

        // Send the transaction
        const hash = await walletClient.sendTransaction({
          account: address,
          to: contract,
          data: callData,
        });
        console.log("hash:", hash);

        // Wait for the transaction receipt
        const transaction = await publicClient.waitForTransactionReceipt({ hash: hash });
        console.log("tx receipt:", transaction);

        // Update state values in parent component which will trigger balanceOf call
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
    }
    console.log("returnData:", returnData);
  };

  // Calls a contract with delegatecall when form is submitted
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chain || !chain?.id) {
      console.log("Chain id is undefined!");
      displayError("Chain id is undefined!");
      return;
    }
    if (!window.ethereum) {
      console.log("Window.ethereum is undefined!");
      displayError("Window.ethereum is undefined!");
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
    setReturnData({ ...returnData, hash: "", simulated: "" });

    const contract = chainData[chain?.id]?.structuredMessage?.main;
    if (!contract) {
      displayError("Contract is undefined!");
      return;
    }
    if (formData.function == "sign") {
      await handleSignFunction(walletClient, address, contract);
    } else {
      await handleRecoverFunction(walletClient, publicClient, address, contract);
    }
  };

  // Handles which input display to show
  const handleInputDisplay = () => {
    if (formData.function == "recover") {
      return (
        <>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="ml-2 p-1.5 text-gray-400 focus:ring-0 rounded w-1/4 bg-gray-300 hover:border-gray-400"
            value={formData.amount}
            onChange={handleInputChange}
          />
          <input
            type="string"
            name="message"
            placeholder="Message"
            className="ml-2 p-1.5 text-gray-400 focus:ring-0 rounded w-1/4 bg-gray-300 hover:border-gray-400"
            value={formData.message}
            onChange={handleInputChange}
          />
          <input
            type="string"
            name="signature"
            placeholder="Signature"
            className="ml-2 p-1.5 text-gray-400 focus:ring-0 rounded w-1/4 bg-gray-300 hover:border-gray-400"
            value={formData.signature}
            onChange={handleInputChange}
          />
        </>
      );
    } else {
      return (
        <div className="text-3xl">
          <span className="text-gray-400 hover:text-gray-300" title="Manditory prefix">
            0x19
          </span>
          <span className="hover:text-gray-300" title="Version prefix">
            0x01
          </span>
          <span className="text-gray-400 hover:text-gray-300">&nbsp; +</span>{" "}
          <span className="hover:text-gray-300" title="Version specific data">
            &nbsp; Domain Separator
          </span>
          <span className="text-gray-400 hover:text-gray-300">&nbsp; +</span>
          <span className="hover:text-gray-400"> {"hashStruct"}</span>
          <span className="text-gray-400">{"("}</span>
          <span className="text-gray-400 text-2xl">
            <input
              type="string"
              name="address"
              placeholder="address"
              className="ml-2 p-1.5 truncate hover:placeholder-gray-500 text-gray-400 placeholder-gray-400 rounded w-[9%] bg-transparent hover:border-gray-400"
              value={formData.address}
              onChange={handleInputChange}
            />
            <span className="text-gray-500 text-4xl">,</span>
            <input
              type="number"
              name="amount"
              placeholder="amount"
              className="ml-2 p-1.5 hover:placeholder-gray-500 text-gray-400 placeholder-gray-400 rounded w-[9%] bg-transparent hover:border-gray-400"
              value={formData.amount}
              onChange={handleInputChange}
            />
            <span className="text-gray-500 text-4xl">,</span>
            <input
              type="string"
              name="message"
              placeholder="Patrick's fav animal"
              className="ml-2 p-1.5 hover:placeholder-gray-500 text-gray-400 placeholder-gray-400 rounded w-[17%] bg-transparent hover:border-gray-400"
              value={formData.message}
              onChange={handleInputChange}
            />
          </span>
          <span className="text-gray-400">{")"}</span>
        </div>
      );
    }
  };

  // Returns the calldata object for sending transactions
  const getCalldata = async () => {
    if (formData.function == "recover") {
      const callData = encodeFunctionData({
        abi: structuredMessageAbi,
        functionName: "recover",
        args: [parseEther(formData.amount), formData.message, formData.signature as `0x${string}`],
      });
      return callData;
    } else {
      return undefined;
    }
  };

  // Returns the simulation result
  const getSimulationResult = async (recoverContract: string, address: string, publicClient: any) => {
    console.log("recoverContract:", recoverContract);
    try {
      if (formData.function == "recover") {
        console.log("args:", formData.message, formData.signature);
        const { result } = (await publicClient.simulateContract({
          address: recoverContract,
          abi: structuredMessageAbi,
          args: [parseEther(formData.amount), formData.message, formData.signature],
          functionName: "recover",
          account: address,
        })) as { result: boolean };
        return result;
      } else {
        return undefined;
      }
    } catch (e: any) {
      displayError(e.message);
      return;
    }
  };

  // Checks to see if form submit button should be disabled
  const checkDisabled = () => {
    if (formData.function == "hash") {
      if (formData.message == "" || formData.amount == "") {
        return true;
      }
    } else if (formData.function == "recover") {
      if (formData.message == "" || formData.signature == "") {
        return true;
      }
    } else if (formData.function == "recoverAmount") {
      if (formData.message == "" || formData.amount == "" || formData.signature == "") {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="mb-4 text-center text-xl">
      Input Form
      <form onSubmit={handleSubmit}>
        {handleInputDisplay()}
        <select
          name="function"
          className="border p-1.5 mt-1 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300 ml-2"
          value={formData.function}
          onChange={handleInputChange}
        >
          <option value="sign">Sign</option>
          <option className="bg-gray-500 text-gray-300" value="recover">
            Recover
          </option>
        </select>
        <div className="flex justify-center gap-2">
          <button
            type="submit"
            disabled={checkDisabled()}
            className="bg-purple-700 border  rounded my-2 px-4 py-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-200 text-gray-500 hover:shadow-lg hover:bg-green-300 w-[50%]"
          >
            {simulateOnly ? "Simulate" : "Execute"}
          </button>

          {/* Checkbox input */}
          <input
            className="bg-gray-500 mt-2"
            type="checkbox"
            id="myCheckbox"
            disabled={formData.function == "sign" || formData.function == "hash"}
            checked={!simulateOnly}
            onChange={handleCheckboxChange}
            style={{ width: "45px", height: "45px", filter: "grayscale(100%)" }}
            title="When checked transactions will actually be executed!"
          />

          {/* Label for the checkbox */}
          <label className="ml-2" htmlFor="myCheckbox" />
        </div>
      </form>
    </div>
  );
};

export default InputForm;
