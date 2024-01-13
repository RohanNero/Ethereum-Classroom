import React, { ChangeEvent, ChangeEventHandler, FormEvent, useEffect, useState } from "react";
import tokenAbi from "../../../../abi/eips/Token";
import { chainData } from "../../../../utils/scaffold-eth/networks";
import type { NextPage } from "next";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { createPublicClient, createWalletClient, custom, encodeFunctionData } from "viem";
import { useNetwork } from "wagmi";
import Error from "~~/components/Error";

// Code blocks
// Silver
const mainDisplayCode = `contract Token  {
  uint public totalSupply;
  mapping(address => uint) public balanceOf;
  mapping(address => mapping(address => uint)) public allowance;
  string public name = "Silver";
  string public symbol = "SLV";
  uint8 public decimals = 18;

  event Transfer(address from, address to, uint amount);
  event Approval(address owner, address spender, uint amount);

  function transfer(address to, uint amount) external returns (bool) {
      balanceOf[msg.sender] -= amount;
      balanceOf[recipient] += amount;
      emit Transfer(msg.sender, recipient, amount);
      return true;
  }

  function approve(address spender, uint amount) external returns (bool) {
      allowance[msg.sender][spender] = amount;
      emit Approval(msg.sender, spender, amount);
      return true;
  }

  function transferFrom(
      address from,
      address to,
      uint amount
  ) external returns (bool) {
      allowance[sender][msg.sender] -= amount;
      balanceOf[sender] -= amount;
      balanceOf[recipient] += amount;
      emit Transfer(sender, recipient, amount);
      return true;
  }

  function mint(uint amount) external {
      balanceOf[msg.sender] += amount;
      totalSupply += amount;
      emit Transfer(address(0), msg.sender, amount);
  }

  function burn(uint amount) external {
      balanceOf[msg.sender] -= amount;
      totalSupply -= amount;
      emit Transfer(msg.sender, address(0), amount);
  }
}`;
// Gold / SimpleSwap
const swapDisplayCode = `contract SimpleSwap is ERC20 {

  address public silverContract;

  constructor(address _silverContract) ERC20("Gold", "GLD") {
      silverContract = _silverContract;
  }

  function swap(uint amount) public returns (uint) {
      ERC20(silverContract).transferFrom(msg.sender, address(this), amount);
      _mint(msg.sender, amount / 10);
      return amount / 10;
  }
}`;

const Home: NextPage = () => {
  // Get current chain info
  const { chain } = useNetwork();

  // Store form input values
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    amount: 0,
    function: "mint",
  });
  // Handle the state of tx interaction, if false the transaction will actually be submitted
  // const [simulateOnly, setSimulateOnly] = useState<boolean>(true);
  // Token balances and tx hash
  const [returnData, setReturnData] = useState({
    silverBalance: 0,
    silverSupply: 0,
    goldBalance: 0,
    goldSupply: 0,
    hash: "",
  });
  // State variable for storing error messages
  const [errorMessage, setErrorMessage] = useState("");

  // State variable for showing/hiding the error popup
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Input changing handler functions - Had to split these into two seperate functions to resolve type errors
  // Function to handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Extract the input value from the event
    const { name, value } = e.target;
    console.log("name:", name);
    console.log("value:", value);

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
      [name]: value,
    });
  };

  // Format the formData function args to be sent
  // const formatArgs = () => {
  //   const argArray = [];
  //   if (formData.from !== "") {
  //     argArray.push(formData.from);
  //   }
  //   if (formData.to !== "") {
  //     argArray.push(formData.to);
  //   }
  //   if (formData.amount !== 0) {
  //     argArray.push(formData.amount);
  //   }

  //   return argArray as unknown;
  // };

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
      const callData = encodeFunctionData({
        abi: tokenAbi,
        functionName: currentFunction,
        args: [BigInt(formData.amount)] as readonly [bigint],
      });
      return callData;
    } else if (currentFunction == "allowance") {
      const callData = encodeFunctionData({
        abi: tokenAbi,
        functionName: currentFunction,
        args: [formData.from, formData.to] as readonly [string, string],
      });
      return callData;
    } else if (currentFunction == "approve" || currentFunction == "transfer") {
      const callData = encodeFunctionData({
        abi: tokenAbi,
        functionName: currentFunction,
        args: [formData.to, BigInt(formData.amount)] as readonly [string, bigint],
      });
      return callData;
    } else if (currentFunction == "transferFrom") {
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

  // Get result from a simulated transaction
  const getSimulationResult = async (toAddress: string, address: string, publicClient: any) => {
    // Ensure the function name is valid
    const currentFunction = formData.function as "mint" | "approve" | "burn" | "transfer" | "transferFrom" | "swap";

    if (currentFunction == "mint" || currentFunction == "burn" || currentFunction == "swap") {
      const { result } = await publicClient.simulateContract({
        address: toAddress,
        abi: tokenAbi,
        args: [BigInt(formData.amount)] as readonly [bigint],
        functionName: currentFunction,
        account: address,
      });
      return result;
    } else if (currentFunction == "approve" || currentFunction == "transfer") {
      const { result } = await publicClient.simulateContract({
        address: toAddress,
        abi: tokenAbi,
        args: [formData.to, BigInt(formData.amount)] as readonly [string, bigint],
        functionName: currentFunction,
        account: address,
      });
      return result;
    } else if (currentFunction == "transferFrom") {
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
    console.log("silver supply:", silverSupply);
    console.log("gold supply:", goldSupply);

    setReturnData(prevData => ({
      ...prevData,
      silverBalance: parseInt(silverBalance.data ?? "0") || 0,
      goldBalance: parseInt(goldBalance.data ?? "0") || 0,
      silverSupply: parseInt(silverSupply.data ?? "0") || 0,
      goldSupply: parseInt(goldSupply.data ?? "0") || 0,
    }));
  };

  // Calls a contract with delegatecall when form is submitted
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

    // Simulate transactions and get the result
    const result = getSimulationResult(toAddress, address, publicClient);
    console.log("Simulaton result:", result);

    // Ensure simulated transaction result is defined
    if (!result) {
      console.log("Simulation result is undefined!");
    }

    // Send the transaction in a try/catch statement
    try {
      // Set hash state to loading state
      setReturnData(prevData => ({
        ...prevData,
        hash: "Loading...",
      }));
      // Send the transaction and get the hash
      const hash = await walletClient.sendTransaction({
        account: address,
        to: toAddress,
        data: callData,
      });
      console.log("hash:", hash);
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
            value={formData.amount}
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
            value={formData.amount}
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
          value={formData.amount}
          onChange={handleInputChange}
        />
      );
    }
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
      {/* <MetaHeader /> */}
      <div className="flex-col mx-auto max-w-screen-xl p-4 font-fantasy text-gray-500">
        <h3 className="text-3xl mb-4 mt-4 text-center ">
          <a className="hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20">
            EIP 20 - Token{" "}
          </a>
        </h3>
        <div className="mb-4 text-gray-400 text-xl text-center">
          <div>
            A standard that outlines the foundation for core token functionality. This standard introduces 6 essential
            functions that all EIP-20 compliant token contract&apos;s must have: <br />
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#totalSupply">
              totalSupply
            </a>{" "}
            returns the total amount of tokens,{" "}
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#balanceOf">
              balanceOf
            </a>{" "}
            returns the token balance of the inputted address,&nbsp;
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#transfer">
              transfer
            </a>{" "}
            sends `amount` of tokens to the `to` address,&nbsp;
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#transferFrom">
              transferFrom
            </a>{" "}
            transfers `amount` of tokens from the `from` address to the `to` address,&nbsp;
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#approve">
              approve
            </a>{" "}
            allows the `spender` to spend `amount` of tokens on behalf of the owner, and finally{" "}
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#allowance">
              allowance
            </a>{" "}
            allows you to view the amount of tokens one address may spend on behalf of another address.{" "}
          </div>
          <div className="mt-4">
            There are 3 additional functions you can interact with on this page, the first two are commonly used in
            token contracts but are not required for the contract to be EIP 20 compliant.{" "}
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#mint">
              mint
            </a>{" "}
            in this example, simply allows anyone to receive `amount` of tokens, while
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#burn">
              {" "}
              burn
            </a>{" "}
            acts as the inverse of this, allowing anyone to get rid of an amount of tokens they own. Typically,
            developers{" "}
            <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#burn">
              {" "}
              burn
            </a>{" "}
            logic will send tokens to an address no one has access to such as&nbsp;
            <a
              className="text-gray-500 hover:text-gray-400"
              href="https://etherscan.io/address/0x000000000000000000000000000000000000dead"
            >
              0x000000000000000000000000000000000000dead
            </a>
            . The final function you can interact with on this page is{" "}
            <a
              className="text-gray-500 hover:text-gray-400"
              href="https://mumbai.polygonscan.com/address/0x0722BCB027F1F65767cb5bc3b343e42f035954D9#code#F1#L21"
            >
              swap
            </a>
            . I&apos;ve created this with the sole purpose of allowing users to get familar with the ERC-20 functions,
            all it does is allow the user to swap <span className="text-gray-300">Silver</span> to{" "}
            <span className="text-amber-300">Gold</span> token at a 10:1 ratio.
          </div>
        </div>
        <div className="mb-4 text-gray-400 text-xl text-center">
          To get started,{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#mint">
            mint
          </a>{" "}
          yourself some tokens! Then try sending some <span className="text-gray-300">SLV</span> to your friends or
          another address you have with{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#transfer">
            transfer
          </a>
          . Finally, test your understanding of the <span className="text-gray-500">approve &rarr; transferFrom</span>{" "}
          flow and swap your tokens for some <span className="text-amber-300">GLD</span>! Don&apos;t forget to check out
          the{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20">
            Official EIP 20 page{" "}
          </a>{" "}
          to see some additional functions that are optional, such as{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#name">
            name
          </a>{" "}
          and{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#symbol">
            symbol
          </a>
        </div>
        <div className="mb-4 w-[60%] mx-auto">
          <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
            {mainDisplayCode}
          </SyntaxHighlighter>
        </div>
        <div className="mb-4 text-center text-2xl flex justify-center gap-4">
          <div className="text-gray-400">
            {" "}
            <span className="text-gray-500">Silver balance: </span>
            {returnData.silverBalance}
          </div>
          <div className="text-gray-400">
            {" "}
            <span className="text-gray-500">Total supply: </span>
            {returnData.silverSupply}
          </div>
          <div className="text-gray-400">
            {" "}
            <span className="text-gray-500">Gold balance: </span>
            {returnData.goldBalance}
          </div>
          <div className="text-gray-400">
            <span className="text-gray-500">Total supply: </span>
            {returnData.goldSupply}
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
            <button className="hover:text-gray-500" title="Click to copy!" onClick={() => copyHexString(true)}>
              {returnData.hash === "Loading..." ? (
                returnData.hash
              ) : (
                <>
                  <span className="text-gray-500">Tx hash:</span> {returnData.hash}
                </>
              )}
            </button>
          </div>
        )}
        {/* This input form should display different input boxes depending on which function is selected */}
        <div className="mb-4 text-center text-xl">
          Input Form
          <form onSubmit={handleSubmit}>
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
                className="bg-purple-700 border rounded my-2 px-4 py-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-200 text-gray-500 hover:shadow-lg hover:bg-green-300 w-[50%]"
              >
                Execute
              </button>

              {/* Checkbox input */}
              {/* <input
                className="bg-gray-500 mt-2"
                type="checkbox"
                id="myCheckbox"
                checked={!simulateOnly}
                onChange={handleCheckboxChange}
                style={{ width: "45px", height: "45px", filter: "grayscale(100%)" }}
                title="When checked transactions will actually be executed!"
              /> */}

              {/* Label for the checkbox */}
              {/* <label className="ml-2" htmlFor="myCheckbox" /> */}
            </div>
          </form>
        </div>
        <div className="mb-4 flex flex-row gap-5 justify-center">
          <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
            {swapDisplayCode}
          </SyntaxHighlighter>
        </div>
        {/* Conditionally render the custom error popup */}
        {showErrorPopup && <Error errorMessage={errorMessage} onClose={closeError} />}
      </div>
    </>
  );
};

export default Home;
