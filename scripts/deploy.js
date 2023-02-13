const hre = require("hardhat");

async function main() {
  const BookLibrary = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await BookLibrary.deploy();

  var res = await bookLibrary.deployed();
  await res.deployTransaction.wait(5);

  await run("verify:verify", {
    address: bookLibrary.address,
    constructorArguments: [],
  });
  var message = "BookLibrary deployed at " + bookLibrary.address;
  await hre.run("print", { message });
}

module.exports = { main };
