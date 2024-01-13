"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viem_1 = require("viem");
// encodeFunctionData args object type error
// args type inferred from ABI
// how do we define the type if the function call can be something different?
var currentFunction = "mint";
var tokenAbi = [
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
var from = "";
var to = "";
var amount = 10;
// Format the formData function args to be sent
var formatArgs = function () {
    var argArray = [];
    if (from !== "") {
        argArray.push("from");
    }
    if (to !== "") {
        argArray.push("to");
    }
    if (amount !== 0) {
        argArray.push(0);
    }
    return argArray; // Adjust the type accordingly
};
var testArgsTypeError = function () {
    // Ensure the function name is valid
    var functionName = currentFunction;
    var args = formatArgs();
    // Encode the function data
    var callData = (0, viem_1.encodeFunctionData)({
        abi: tokenAbi,
        functionName: functionName,
        args: args,
    });
    console.log("CallData:", callData);
};
console.log("test");
testArgsTypeError();
