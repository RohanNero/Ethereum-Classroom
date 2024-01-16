import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Code blocks
const mainDisplayCode = `contract Delegatecall {

  uint public x;

  function delegate(address y, uint z) public returns(uint) {
          y.delegatecall(abi.encode(z));
          return x;
  }
}`;

// All of the hard coded text for EIP 7 - Delegatecall as well as the main display code
const Text = () => {
  return (
    <>
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
        , the main difference is that the logic in the target contract is executed with the context of the contract that
        is calling it. Meaning a contract that uses{" "}
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
    </>
  );
};

export default Text;
