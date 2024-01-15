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
] as const;

export default delegateAbi;
