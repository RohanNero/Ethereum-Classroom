import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Code blocks
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

// This code displays all code blocks for EIP 7 - Delegatecall except for the main code block
const ExtraCodeBlocks = () => {
  return (
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
  );
};

export default ExtraCodeBlocks;
