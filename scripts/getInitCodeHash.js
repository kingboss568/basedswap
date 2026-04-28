// Computes the keccak256 hash of the BasedSwapPair creation code.
// This hash MUST be hardcoded into BasedSwapLibrary.pairFor() so the
// router can compute pair addresses without external calls.
//
// Usage: npx hardhat run scripts/getInitCodeHash.js

const hre = require("hardhat");

async function main() {
  const Pair = await hre.ethers.getContractFactory("BasedSwapPair");
  const bytecode = Pair.bytecode;
  const initCodeHash = hre.ethers.keccak256(bytecode);

  console.log("\nBasedSwapPair init code hash:");
  console.log(initCodeHash);
  console.log("\nReplace the hex value in contracts/libraries/BasedSwapLibrary.sol");
  console.log("inside the pairFor() function with this value (without 0x prefix).");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
