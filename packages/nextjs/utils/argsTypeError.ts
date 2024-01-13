import { encodeFunctionData } from "viem";

// encodeFunctionData args object type error
// args type inferred from ABI
// how do we define the type if the function call can be something different?

const currentFunction = "mint";

const tokenAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "address", name: "spender", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "from", type: "address" },
      { indexed: false, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "swap",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const from = "";
const to = "";
let amount: number;

// Format the formData function args to be sent
const formatArgs = ():
  | readonly [string, string, bigint]
  | readonly [string, bigint]
  | readonly [bigint]
  | readonly [] => {
  const argArray = [];
  if (from !== "") {
    argArray.push("from");
  }
  if (to !== "") {
    argArray.push("to");
  }
  if (amount !== 0) {
    argArray.push(0);
  }

  return argArray as any; // Adjust the type accordingly
};

const setValues = () => {
  amount = 10;
};

const testArgsTypeError = () => {
  // Ensure the function name is valid
  const functionName = currentFunction as
    | "mint"
    | "allowance"
    | "approve"
    | "burn"
    | "transfer"
    | "transferFrom"
    | "swap";
  setValues();
  const args = formatArgs();

  // Encode the function data
  const callData = encodeFunctionData({
    abi: tokenAbi,
    functionName: functionName,
    args: args as
      | readonly [bigint]
      | readonly [string, bigint]
      | readonly [string, string]
      | readonly [string, string, bigint],
  });

  console.log("CallData:", callData);
};

console.log("test");

testArgsTypeError();
