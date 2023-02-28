require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const lazyImport = async (module) => {
  return await import(module);
};

task("deploy", "Deploys contracts").setAction(async () => {
  const { main } = await lazyImport("./scripts/deploy.js");
  await main();
});

subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.INFURA_URL_GOERLI,
      chainId: 5,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
    mumbai: {
      url: process.env.MUMBAI_TESNET_URL,
      accounts: [process.env.PRIVATE_KEY || ""],
      timeout: 0,
      gas: "auto",
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
    // apiKey: "CHIRAADNUI814XIT9ST36R63UFNBNDKBDY",
  },
};
