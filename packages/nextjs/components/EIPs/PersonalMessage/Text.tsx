import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Code blocks
const mainDisplayCode = `// Viem 
const signature = await walletClient.signMessage({
    account: address,
    message: formData.message,
  });

// web3.js
const signature = await web3.eth.accounts.sign(data, privateKey);

// ethers
const signature = await signer.signMessage(message)`;

// All of the hard coded text for EIP 7 - Delegatecall as well as the main display code
const Text = () => {
  return (
    <>
      <h3 className="text-3xl mb-4 mt-4 text-center ">
        <a className="hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-191">
          EIP 191 - Personal Message
        </a>
      </h3>{" "}
      <div className="mb-4 text-gray-400 text-xl text-center">
        A standard created to define how users can safely send signed data on Ethereum! All EIP compliant data is
        prepended with{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-191">
          0x19
        </a>{" "}
        followed by 1 more byte that specifies which version of the standard you are using. On this page, we will be
        focusing on version{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-191#version-0x45-e">
          0x45
        </a>
        . This deals with &quot;personal_sign&quot; messages, which can be any arbitrary data. All{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-191">
          EIP 191
        </a>{" "}
        data follows this format: &nbsp;
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-191#specification">
          0x19 &lt;version byte&gt; &lt;version specific data&gt; &lt;data to sign&gt;
        </a>{" "}
        , but the version you will be interacting with is formatted like so:&nbsp;
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-191#specification">
          0x19 0x45 thereum Signed Message:\n&quot; + len(message) &lt;data to sign&gt;
        </a>{" "}
        . Note:{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-191#version-0x45-e">
          0x45
        </a>{" "}
        is the hexadecimal form of <span className="text-gray-500 hover:text-gray-400">E</span>.
        <div className="mt-2">
          To get acquainted with signing personal messages, you can sign different ones below for yourself, while seeing
          the actual code above you. Once you understand this part, try playing with the{" "}
          <span className="text-gray-500 hover:text-gray-400">Recover</span> smart contract and{" "}
          <span className="text-gray-500 hover:text-gray-400">ecrecover</span> to confirm a message was sent by you.
          Hint: If you ask nicely, the <span className="text-gray-500 hover:text-gray-400">Recover</span> contract is
          known to be mighty generous, check out the code at the bottom of the page for more information.
        </div>
      </div>
      <div className="mb-4 w-[60%] mx-auto">
        <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
          {mainDisplayCode}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export default Text;
