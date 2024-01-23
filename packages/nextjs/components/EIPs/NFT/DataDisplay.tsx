import React, { useEffect, useState } from "react";
import Image from "next/image";
import nftAbi from "../../../abi/eips/NFT";
import tokenAbi from "../../../abi/eips/Token";
import { chainData } from "../../../utils/scaffold-eth/networks";
import baycImage from "public/NFT_bayc.png";
import miladyImage from "public/NFT_milady.png";
import punkImage from "public/NFT_punk.png";
import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeFunctionResult,
  encodeFunctionData,
  formatEther,
} from "viem";
import { useNetwork } from "wagmi";

interface TokenReturnDataType {
  nftBalance: number;
  goldBalance: number;
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

  const [nftData, setNftData] = useState([{ tokenId: 0, img: "" }]);

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

    // Construct calldata object for ERC-20 and ERC-721 balanceOf
    const callData = encodeFunctionData({
      abi: tokenAbi,
      args: [accounts[0]],
      functionName: "balanceOf",
    });
    const nftCalldata = encodeFunctionData({
      abi: nftAbi,
      args: [accounts[0]],
      functionName: "balanceOf",
    });

    if (!chain || !chain?.id) {
      displayError("Chain is undefined!");
      return;
    }
    const goldContract = chainData[chain?.id]?.token?.swap;
    const nftContract = chainData[chain?.id]?.nft?.main;
    if (!goldContract || !nftContract) {
      displayError("NFT or Gold contract is undefined, try another chain!");
      return;
    }
    console.log("Gold contract:", goldContract);
    console.log("NFT contract:", nftContract);

    // View NFT and Gold balance
    const nftBalance = await publicClient.call({
      data: nftCalldata,
      to: nftContract,
    });
    console.log("nftBalance:", nftBalance);
    const goldBalance = await publicClient.call({
      data: callData,
      to: goldContract,
    });
    if (!goldBalance?.data || !nftBalance?.data) {
      displayError("Gold balance is undefined!");
      console.log("goldBalance:", goldBalance);
      setReturnData({
        ...returnData,
        goldBalance: 0,
        nftBalance: 0,
      });
      return;
    }
    console.log("Gold balance:", parseInt(goldBalance.data.toString()));

    // Handle displaying the NFTs on the page
    const tokenIdArray = await getOwnedNfts(accounts[0], nftContract, publicClient);
    console.log("tokenIdArray:", tokenIdArray);

    const metadata = await getMetadata(tokenIdArray, accounts[0], nftContract, publicClient);
    console.log("metadata:", metadata);

    setReturnData(prevData => ({
      ...prevData,
      nftBalance: parseInt(nftBalance.data ?? "0") || 0,
      goldBalance: parseInt(goldBalance.data ?? "0") || 0,
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
      copyText = chainData[chain?.id]?.nft?.main || "";
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

  // Function that returns an array of tokenIds the user owns
  const getOwnedNfts = async (userAddress: string, nftContract: string, publicClient: any) => {
    // Get user address and NFT contract address
    // Call getMintCounter() function
    const mintCounterCalldata = encodeFunctionData({
      abi: nftAbi,
      functionName: "getMintCounter",
    });

    const mintCountRaw = await publicClient.call({
      data: mintCounterCalldata,
      to: nftContract,
    });
    const mintCount = parseInt(mintCountRaw.data);
    console.log("mintCount:", mintCount);

    // Loop from 0 - getMintCounter() return value and push the current index to the array if ownerOf() == userAddress
    const tokenIds = [];
    for (let index = 0; index < mintCount; index++) {
      const owner = await getOwnerOf(index, userAddress, nftContract, publicClient);
      if (owner == userAddress) {
        tokenIds.push(index);
        console.log("Pushing tokenId:", index);
      }
    }
    console.log("tokenIds:", tokenIds);
    // Return the array
    return tokenIds;
  };

  // Returns the owner of an NFT
  const getOwnerOf = async (tokenId: number, userAddress: string, nftContract: string, publicClient: any) => {
    try {
      const ownerOfCalldata = encodeFunctionData({
        abi: nftAbi,
        args: [BigInt(tokenId)],
        functionName: "ownerOf",
      });
      const ownerRaw = await publicClient.call({
        data: ownerOfCalldata,
        to: nftContract,
      });
      const owner = decodeFunctionResult({
        abi: nftAbi,
        functionName: "ownerOf",
        data: ownerRaw.data,
      });
      console.log("owner:", owner);
      return owner;
    } catch (error) {
      return undefined;
    }
  };

  // Returns the metadata of an NFT
  const getMetadata = async (tokenIds: number[], userAddress: string, nftContract: string, publicClient: any) => {
    const nfts: {
      tokenId: number;
      img: string;
    }[] = [];
    for (const id of tokenIds) {
      const tokenUriCalldata = encodeFunctionData({
        abi: nftAbi,
        args: [BigInt(id)],
        functionName: "tokenURI",
      });
      const metadataRaw = await publicClient.call({
        data: tokenUriCalldata,
        to: nftContract,
      });
      const metadata = decodeFunctionResult({
        abi: nftAbi,
        functionName: "tokenURI",
        data: metadataRaw.data,
      });
      console.log("metadata:", metadata);
      nfts.push({ tokenId: id, img: metadata });
    }
    setNftData(nfts);
  };

  // Gets image from metadata since we can't directly display IPFS URI
  const getImageFromMetaData = (metadata: string) => {
    console.log("input:", metadata);
    if (metadata == "ipfs://Qme3dEBs7xaLVLC97J52pchVC5AVcZYjpSEyHdi3EHG4LU") {
      return punkImage;
    } else if (metadata == "ipfs://QmddfC4y9Ro3x9QwPvqduehZCYzGwycYxdbUE5CZ5DPihy") {
      return baycImage;
    } else {
      // "ipfs://QmQrgTXhcVTTWho1buaHSbg4FWQ9sUq6vADGfRLwXPxKFF"
      return miladyImage;
    }
  };

  // Handles which NFT div object to display on the frontend
  const handleNftDisplay = () => {
    const nftElements = nftData.map(nft => (
      <div key={nft.tokenId} className="border w-[10%] bg-gray-300 inline-block m-2">
        <div className="w-full h-28 bg-gray-300 relative">
          <Image
            className="absolute px-3 pt-3 w-full h-full object-cover"
            src={getImageFromMetaData(nft.img)}
            alt={`NFT ${nft.tokenId}`}
          />
        </div>
        <p className="text-center">Token ID: {nft.tokenId}</p>
      </div>
    ));

    // Now you can return the HTML or use nftElements in your component
    return nftElements;
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
        {/* <div className="text-gray-400">
          {" "}
          <span className="text-gray-500">Silver balance: </span>
          {formatEther(BigInt(returnData.silverBalance))}
        </div> */}
        <div className="text-gray-400">
          {" "}
          <span className="text-gray-500">NFT balance: </span>
          {returnData.nftBalance}
        </div>
        <div className="text-gray-400">
          {" "}
          <span className="text-gray-500">Gold balance: </span>
          {formatEther(BigInt(returnData.goldBalance))}
        </div>
      </div>
      {chain && chain?.id && (
        <div className="mb-4 text-center text-gray-400 text-2xl">
          <span className="text-gray-500 mr-1">NFT contract:</span>
          <button className="hover:text-gray-500" title="Click to copy!" onClick={() => copyHexString(false)}>
            {chainData[chain?.id]?.nft?.main}
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
      <div className="mb-4 text-center text-gray-400 text-2xl">
        NFT Display
        <div>{handleNftDisplay()}</div>
      </div>
    </>
  );
};

export default DataDisplay;
