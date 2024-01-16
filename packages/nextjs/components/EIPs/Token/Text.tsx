import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

// Silver contract
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

// All of the hard coded text for EIP 20 - Token as well as the main display code
const Text = () => {
  return (
    <>
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
          sends `amount` of tokens to the inputted address,&nbsp;
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#transferFrom">
            transferFrom
          </a>{" "}
          transfers an inputted amount of tokens from one address to another address.,&nbsp;
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#approve">
            approve
          </a>{" "}
          allows the `spender` to spend `amount` of tokens on behalf of the owner, and finally{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#allowance">
            allowance
          </a>{" "}
          allows you to view the amount of tokens one address may spend on behalf of another address. Please note, there
          are also two events that must be implemented.{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#transfer-1">
            Transfer
          </a>{" "}
          must be emitted when any tokens are transferred and{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#approval">
            Approval
          </a>{" "}
          must be emitted when the{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#approve">
            approve
          </a>{" "}
          function is called.
        </div>
        <div className="mt-4">
          There are a few other functions you can interact with on this page, the first two are commonly used in token
          contracts but are not required for the contract to be EIP 20 compliant.{" "}
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#mint">
            mint
          </a>{" "}
          in this example, simply allows anyone to receive `amount` of tokens, while
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#burn">
            {" "}
            burn
          </a>{" "}
          acts as the inverse of this, allowing anyone to render an amount of tokens they own unusable. A common way
          developers do this is by making their
          <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#burn">
            {" "}
            burn
          </a>{" "}
          logic send tokens to an address no one has access to such as&nbsp;
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
          . I&apos;ve created this with the sole purpose of allowing you to get familar with some of the ERC-20
          functions, all it does is enable you to swap <span className="text-gray-300">Silver</span> for{" "}
          <span className="text-amber-300">Gold</span> tokens at a 10:1 ratio.
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
        to see three additional functions that are optional:{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#name">
          name,
        </a>{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#symbol">
          symbol&nbsp;
        </a>
        and{" "}
        <a className="text-gray-500 hover:text-gray-400" href="https://eips.ethereum.org/EIPS/eip-20#decimals">
          decimals.
        </a>
      </div>{" "}
      <div className="mb-4 w-[60%] mx-auto">
        <SyntaxHighlighter className="border rounded-2xl" language="typescript" style={atomOneDark}>
          {mainDisplayCode}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export default Text;
