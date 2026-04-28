const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const network = hre.network.name;
  console.log("Network:", network);

  // ---- 1. Deploy Factory ----
  console.log("\n[1/2] Deploying BasedSwapFactory...");
  const Factory = await hre.ethers.getContractFactory("BasedSwapFactory");
  const factory = await Factory.deploy(deployer.address); // feeToSetter = deployer
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("BasedSwapFactory deployed to:", factoryAddress);

  // ---- 2. Get / Deploy WETH ----
  // Real WETH addresses on Base:
  //   Base mainnet:   0x4200000000000000000000000000000000000006
  //   Base Sepolia:   0x4200000000000000000000000000000000000006 (canonical)
  let wethAddress;
  if (network === "base" || network === "baseSepolia") {
    wethAddress = "0x4200000000000000000000000000000000000006";
    console.log("\nUsing canonical WETH:", wethAddress);
  } else {
    // For local hardhat, you'd need to deploy a mock WETH. Skipping here.
    throw new Error("WETH address not configured for network: " + network);
  }

  // ---- 3. Deploy Router ----
  console.log("\n[2/2] Deploying BasedSwapRouter02...");
  const Router = await hre.ethers.getContractFactory("BasedSwapRouter02");
  const router = await Router.deploy(factoryAddress, wethAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("BasedSwapRouter02 deployed to:", routerAddress);

  // ---- Summary ----
  console.log("\n========================================");
  console.log("Deployment complete!");
  console.log("========================================");
  console.log("Network:        ", network);
  console.log("Factory:        ", factoryAddress);
  console.log("Router:         ", routerAddress);
  console.log("WETH:           ", wethAddress);
  console.log("feeToSetter:    ", deployer.address);
  console.log("========================================");
  console.log("\nNEXT STEPS:");
  console.log("1. Copy these addresses into frontend/lib/contracts.ts");
  console.log("2. Run `npm run init-hash` to get the BasedSwapPair init code hash");
  console.log("3. Replace the hash in contracts/libraries/BasedSwapLibrary.sol");
  console.log("4. Re-deploy if you changed the library");
  console.log("5. Verify contracts on BaseScan with `npm run verify:<network> <address> <args>`");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
