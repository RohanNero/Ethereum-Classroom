import React, { ChangeEvent, FormEvent, useState } from "react";
import delegateAbi from "../../../abi/eips/Delegatecall";
import { chainData } from "../../../utils/scaffold-eth/networks";
import { createPublicClient, createWalletClient, custom, encodeFunctionData } from "viem";
import { useNetwork } from "wagmi";

interface ReturnDataType {
  simulated: string;
  executedHash: string;
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
    input: "",
    to: "add",
  });

  // Handle the state of tx interaction, if false the transaction will actually be submitted
  const [simulateOnly, setSimulateOnly] = useState<boolean>(true);

  // Function to handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Extract the input value from the event
    const { name, value } = e.target;

    // Check if the input for x value is a valid integer
    if (name == "input" && !/^\d*$/.test(value)) {
      console.log(`Invalid input character: ${value} `);
      return;
    }

    // Update the state only if it's a valid integer
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Update simulateOnly state value depending on checkbox status
  const handleCheckboxChange = () => {
    // Toggle the state when the checkbox is clicked
    setSimulateOnly(!simulateOnly);
    console.log("simulate value:", simulateOnly);
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

    if (!formData?.to) {
      displayError("formData.to is undefined!");
      return;
    }

    const childContract = formData.to as keyof { main: string; add: string; sub: string; mul: string; reset: string };

    if (!childContract) {
      displayError("Child contract string is undefined!");
      return;
    }

    // Get address using key e.g. add, sub, mul
    const toAddress = chainData[chain?.id]?.delegatecall?.[childContract];
    const mainAddress = chainData[chain?.id]?.delegatecall?.main;

    if (!toAddress || !mainAddress) {
      displayError("Chain address is undefiend!");
      return;
    }

    const callData = encodeFunctionData({
      abi: delegateAbi,
      functionName: "delegate",
      args: [toAddress, BigInt(formData.input)],
    });

    console.log("toAddress:", toAddress);
    console.log("input:", formData.input);
    console.log("calldata:", callData);

    // Simulate `delegate` tx
    const { result } = (await publicClient.simulateContract({
      address: mainAddress,
      abi: delegateAbi,
      args: [toAddress, BigInt(formData.input)],
      functionName: "delegate",
      account: address,
    })) as { result: bigint };

    console.log("result:", result.toString());

    setReturnData(prevData => ({
      ...prevData,
      simulated: result.toString(),
    }));

    // If simulateOnly is false, execute the transaction
    if (simulateOnly == false) {
      // Call `delegate`
      try {
        setReturnData(() => ({
          simulated: "",
          executedHash: "Loading...",
        }));
        const delegateHash = await walletClient.sendTransaction({
          account: address,
          to: chainData[chain?.id]?.delegatecall?.main,
          data: callData,
        });
        console.log("hash:", delegateHash);
        const transaction = await publicClient.waitForTransactionReceipt({ hash: delegateHash });
        console.log("tx receipt:", transaction);
        setReturnData(prevData => ({
          ...prevData,
          executedHash: delegateHash,
        }));
      } catch (error: any) {
        displayError(error);
        setReturnData(prevData => ({
          ...prevData,
          executedHash: "",
        }));
      }
    }
    console.log("returnData:", returnData);
  };

  return (
    <div className="mb-4 text-center text-xl">
      Input Form
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="input"
          step="1"
          placeholder="Input value"
          className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300"
          value={formData.input}
          onChange={handleInputChange}
        />
        <select
          name="to"
          className="border p-1.5 text-gray-500 focus:ring-0 rounded w-1/4 bg-gray-300 hover:bg-gray-400 hover:text-gray-300 ml-2"
          value={formData.to}
          onChange={handleInputChange}
        >
          <option value="add">Addition</option>
          <option value="sub">Subtraction</option>
          <option value="mul">Multiplication</option>
          <option value="reset">Reset X to 0</option>
        </select>
        <div className="flex justify-center gap-2">
          <button
            type="submit"
            disabled={formData.input === ""}
            className="bg-purple-700 border  rounded my-2 px-4 py-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-200 text-gray-500 hover:shadow-lg hover:bg-green-300 w-[50%]"
          >
            {simulateOnly ? "Simulate" : "Execute"}
          </button>

          {/* Checkbox input */}
          <input
            className="bg-gray-500 mt-2"
            type="checkbox"
            id="myCheckbox"
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
