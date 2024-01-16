// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Token  {
    uint public totalSupply;
    mapping(address => uint) private _balanceOf;
    mapping(address => mapping(address => uint)) public _allowance;
    string public name = "Silver";
    string public symbol = "SLV";
    uint8 public decimals = 18;

    event Transfer(address from, address to, uint amount);
    event Approval(address owner, address spender, uint amount);

    function balanceOf(address account) external view returns (uint) {
        return _balanceOf[account];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowance[owner][spender];
    }

    function transfer(address recipient, uint amount) external returns (bool) {
        _balanceOf[msg.sender] -= amount;
        _balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        _allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool) {
        _allowance[sender][msg.sender] -= amount;
        _balanceOf[sender] -= amount;
        _balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external {
        _balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
        _balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
