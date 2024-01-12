import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { chainData } from "../../../../utils/scaffold-eth/networks";
import type { NextPage } from "next";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { createPublicClient, createWalletClient, custom, encodeFunctionData } from "viem";
import { useNetwork } from "wagmi";
import Error from "~~/components/Error";

// Code blocks
const mainDisplayCode = `contract Delegatecall {

  uint public x;

  function delegate(address y, uint z) public returns(uint) {
          y.delegatecall(abi.encode(z));
          return x;
  }
}`;

const additionDisplayCode = `contract AdditionContract {
  uint public x;
  fallback() external payable {
      uint input = abi.decode(msg.data, (uint));
      x = x + input;
   }
}`;
const subtractionDisplayCode = `contract SubtractionContract {
  uint public x;
  fallback() external payable {
     uint input = abi.decode(msg.data, (uint));
     x = x - input;
  }
}`;
const multiplicationDisplayCode = `contract MultiplicationContract {
  uint public x;
  fallback() external payable {
        uint input = abi.decode(msg.data, (uint));
        x = x * input;
    }
 }`;

// Delegatecall ABI
const delegateAbi = [
  {
    inputs: [
      { internalType: "address", name: "y", type: "address" },
      { internalType: "uint256", name: "z", type: "uint256" },
    ],
    name: "delegate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "x",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const Home: NextPage = () => {
  // Get current chain info
  const { chain } = useNetwork();
  // Store X value
  const [xValue, setXValue] = useState(0);
  // Store form input values
  const [formData, setFormData] = useState({
    input: "",
    to: "add",
  });
  // Handle the state of tx interaction, if false the transaction will actually be submitted
  const [simulateOnly, setSimulateOnly] = useState<boolean>(true);
  // Simulated tx X value and executed tx hash
  const [returnData, setReturnData] = useState({
    simulated: "",
    executedHash: "",
  });
  // State variable for storing error messages
  const [errorMessage, setErrorMessage] = useState("");

  // State variable for showing/hiding the error popup
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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

    if (!chainData[chain?.id]?.delegatecall?.[childContract]) {
      displayError("Chain address is undefiend!");
      return;
    }

    // Get address using key e.g. add, sub, mul
    const toAddress = chainData[chain?.id]?.delegatecall?.[childContract];
    if (!toAddress) {
      displayError("Delegatecall contract address is undefined!");
      return;
    }

    const callData = encodeFunctionData({
      abi: delegateAbi,
      functionName: "delegate",
      args: [toAddress, formData.input],
    });

    // Simulate `delegate` tx
    const { result } = (await publicClient.simulateContract({
      address: toAddress,
      abi: delegateAbi,
      args: [toAddress, formData.input],
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
        setReturnData(prevData => ({
          ...prevData,
          executedHash: "Loading...",
        }));
        const delegateHash = await walletClient.sendTransaction({
          account: address,
          to: toAddress,
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

  // Code for viewing Delegatecall's `x` value
  useEffect(() => {
    // console.log("chain:", chain.id);
    // console.log("Delegatecall adress:", chainData[chain.id].delegatecall.main);
    if (!chain) {
      return;
    }
    getXValue();
  }, [chain, returnData]);

  return (
    <>
      {/* <MetaHeader /> */}
      <div className="flex-col mx-auto max-w-screen-xl p-4 font-fantasy text-gray-500">
        <h3 className="text-3xl mb-4 mt-4 text-center ">
          <a className="hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-7">
            EIP 7 - Delegatecall
          </a>
        </h3>{" "}
        <div className="mb-4 text-gray-400 text-xl text-center">
          A low level function that acts almost identical to{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://solidity-by-example.org/call/">
            call
          </a>
          , the main difference is that the logic in the target contract is executed with the context of the calling
          contract. Meaning a contract that uses{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://solidity-by-example.org/delegatecall/">
            delegatecall
          </a>{" "}
          may alter its own storage variables while using logic from other contracts.
        </div>{" "}
        <div className="mb-4 text-gray-400 text-xl text-center">
          For example, if contract A uses{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://solidity-by-example.org/delegatecall/">
            delegatecall
          </a>{" "}
          on contract B and contract B&apos;s logic stores a variable to storage, the variable will actually be stored
          inside contract A. You can test it yourself by simulating or executing transactions below.
        </div>
        <div className="mb-4 w-[60%] mx-auto">
          <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
            {mainDisplayCode}
          </SyntaxHighlighter>
        </div>
        <div className="mb-4 text-center text-2xl flex justify-center gap-4">
          <div>{`Current X value: ${xValue}`}</div>
          {returnData.simulated !== "" && <div>{`Simulated value: ${returnData.simulated}`}</div>}
        </div>
        {returnData.executedHash !== "" && (
          <div className="mb-4 text-center text-gray-400 text-2xl">
            <button className="hover:text-gray-500" title="Click to copy!" onClick={copyHash}>
              {returnData.executedHash == "Loading..."
                ? returnData.executedHash
                : `Tx hash: ${returnData.executedHash}`}
            </button>
          </div>
        )}
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
        <div className="mb-4 flex flex-row gap-5 justify-center">
          <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
            {additionDisplayCode}
          </SyntaxHighlighter>
          <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
            {subtractionDisplayCode}
          </SyntaxHighlighter>
          <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
            {multiplicationDisplayCode}
          </SyntaxHighlighter>
        </div>
        {/* Conditionally render the custom error popup */}
        {showErrorPopup && <Error errorMessage={errorMessage} onClose={closeError} />}
      </div>
    </>
  );
};

export default Home;
