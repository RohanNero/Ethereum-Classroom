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

  /** Personal Message - EIP 191 */
  const recover = await deploy("Recover", {
    from: deployer,
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    waitConfirmations: 5,
  });

  // Verify Recover
  try {
    console.log(`Verifying contract at address ${recover.address}...`);
    await hre.run("verify:verify", {
      address: recover.address,
      contract: "contracts/EIPs/Token/Token.sol:Token",
    });
  } catch (error: any) {
    if (error.message.includes("already verified")) {
      console.log(`Contract at address ${recover.address} already verified!`);
    } else if (error.message.includes("recently deployed")) {
      console.error(`Contract bytecode not available yet, try again in a minute!`);
    } else {
      console.error(`Error verifying contract at address ${recover.address}:`, error);
    }
  }
};

export default deployEIPs;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags eip
deployEIPs.tags = ["eip", "personal", "191"];
