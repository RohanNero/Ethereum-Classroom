import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Code blocks

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

// This code displays all code blocks for EIP 20 - Token except for the main code block
const ExtraCodeBlocks = () => {
  return (
    <div className="mb-4 flex flex-row gap-5 justify-center">
      <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
        {swapDisplayCode}
      </SyntaxHighlighter>
    </div>
  );
};

export default ExtraCodeBlocks;
