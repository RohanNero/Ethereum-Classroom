import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the EIP contracts
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployEIPs: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  /** Delegatecall - EIP 7 */
  const delegatecall = await deploy("Delegatecall", {
    from: deployer,
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    waitConfirmations: 5,
  });

  const add = await deploy("AdditionContract", {
    from: deployer,
    log: true,
    autoMine: true,
    waitConfirmations: 5,
  });

  const sub = await deploy("SubtractionContract", {
    from: deployer,
    log: true,
    autoMine: true,
    waitConfirmations: 5,
  });

  const mul = await deploy("MultiplicationContract", {
    from: deployer,
    log: true,
    autoMine: true,
    waitConfirmations: 5,
  });

  const reset = await deploy("ResetContract", {
    from: deployer,
    log: true,
    autoMine: true,
    waitConfirmations: 5,
  });

  const contractsToVerify = [
    { address: delegatecall.address, contract: "contracts/Delegatecall/Delegatecall.sol:Delegatecall" },
    { address: add.address, contract: "contracts/Delegatecall/Delegatecall.sol:AdditionContract" },
    { address: sub.address, contract: "contracts/Delegatecall/Delegatecall.sol:SubtractionContract" },
    { address: mul.address, contract: "contracts/Delegatecall/Delegatecall.sol:MultiplicationContract" },
    { address: reset.address, contract: "contracts/Delegatecall/Delegatecall.sol:ResetContract" },
  ];

  for (const contract of contractsToVerify) {
    try {
      console.log(`Verifying contract at address ${contract.address}...`);
      console.log("contract:", contract);
      await hre.run("verify:verify", {
        address: contract.address,
        contract: contract.contract,
      });
    } catch (error) {
      if (error.message.includes("already verifie")) {
        console.log(`Contract at address ${contract.address} already verified!`);
      } else if (error.message.includes("recently deployed")) {
        console.error(`Contract bytecode not available yet, try again in a minute!`);
      } else {
        console.error(`Error verifying contract at address ${contract.address}:`, error);
      }
    }
  }

  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployEIPs;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags eip
deployEIPs.tags = ["eip", "delegatecall", "7"];
