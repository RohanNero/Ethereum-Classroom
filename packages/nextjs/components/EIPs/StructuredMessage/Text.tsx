import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Code blocks
const mainDisplayCode = `// Define the domain separator values
const domain = {
  name: "Ethereum Classroom",
  version: "1",
  chainId: chain?.id,
  verifyingContract: chainData[chain?.id].structuredMessage.main,
};

// Named list of all type definitions
const types = {
  Info: [
    { name: "student", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "patricksFavAnimal", type: "string" },
  ],
};

// Sign the data with Viem's 'signedTypedData' method
const signature = await walletClient.signTypedData({
  account: address,
  domain,
  types,
  primaryType: "Info",
  message: {
    student: formData.address,
    amount: formData.amount,
    patricksFavAnimal: formData.message,
  },
});`;

// All of the hard coded text for EIP 7 - Delegatecall as well as the main display code
const Text = () => {
  return (
    <>
      <h3 className="text-3xl mb-4 mt-4 text-center ">
        <a className="hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-712">
          EIP 712 - Structured Message
        </a>
      </h3>{" "}
      <div className="mb-4 text-gray-400 text-xl text-center">
        While{" "}
        <a className="hover:text-gray-400 text-gray-500" href="https://eips.ethereum.org/EIPS/eip-191">
          EIP 191
        </a>{" "}
        standardized a way for signing simple byte strings, in reality people often want to sign more complex data, and
        that is where{" "}
        <a className="hover:text-gray-400 text-gray-500" href="https://eips.ethereum.org/EIPS/eip-712">
          EIP 712
        </a>{" "}
        comes in! This standard maintains backwards compatibility with{" "}
        <a className="hover:text-gray-400 text-gray-500" href="https://eips.ethereum.org/EIPS/eip-191">
          191
        </a>{" "}
        and still begins with the{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-712">
          0x19
        </a>{" "}
        prefix. The standard&apos;s version byte is{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-712">
          0x01
        </a>{" "}
        . The version specific data is known as the{" "}
        <a
          className="text-gray-500 hover:text-gray-400"
          href="https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator"
        >
          {" "}
          domain separator
        </a>{" "}
        and contains data specific to the current context such as a chain Id in order to prevent the signed data from
        being used in other unwanted transactions. The actual data object is a little more complicated than the previous
        standard, this is due to the fact that{" "}
        <a className="hover:text-gray-400 text-gray-500" href="https://eips.ethereum.org/EIPS/eip-712">
          EIP 712
        </a>{" "}
        encodes the data along with its structure so that it can later be displayed back to the user on a frontend.
        You&apos;ll see exactly what I mean when you try to sign a transaction below. The entire format for this
        standard looks something like:{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-712">
          0x19
        </a>{" "}
        +
        <a className="text-gray-500 hover:text-gray-400 ml-1" href="https://eips.ethereum.org/EIPS/eip-712">
          0x01
        </a>{" "}
        +
        <a
          className="text-gray-500 hover:text-gray-400 ml-1"
          href="https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator"
        >
          {" "}
          Domain Separator
        </a>{" "}
        +
        <a
          className="text-gray-500 hover:text-gray-400 ml-1"
          href="https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator"
        >
          {"hashStruct("}
        </a>
        message
        <span className="text-gray-500">{")"}</span>.
        <div className="mt-2">
          To complete this exercise,
          <a className="text-gray-500 hover:text-gray-400" href="https://twitter.com/PatrickAlphaC">
            {" "}
            Patrick Collins
          </a>{" "}
          has volunteered to teach some of you, but only if you can pass a structured message containing one of his
          favorite animals! Good luck increasing your{" "}
          <span className="text-gray-500 hover:text-gray-400">knowledge</span>!
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
