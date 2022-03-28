import { expect } from "chai";
import { ethers } from "hardhat";

describe("DripToken", function () {
  it("should deploy succesfully", async function () {
    const DripToken = await ethers.getContractFactory("DripToken");
    const contract = await DripToken.deploy();
    await contract.deployed();
    expect(await contract.name()).to.equal("DripToken");
    expect(await contract.symbol()).to.equal("DRIP");
  });
  it("should register an account", async function () {
    const DripToken = await ethers.getContractFactory("DripToken");
    const contract = await DripToken.deploy();
    await contract.deployed();
    const accounts = await ethers.getSigners();
    const signer = accounts[0];
    const drip = await contract.connect(signer);
    await drip.register();
    expect(await drip.isRegistered(signer.address)).to.equal(true);
  });
  it("should stream tokens", async function () {
    const DripToken = await ethers.getContractFactory("DripToken");
    const contract = await DripToken.deploy();
    await contract.deployed();
    const accounts = await ethers.getSigners();
    const signer = accounts[0];
    const drip = await contract.connect(signer);
    await drip.register();
    const dripBalance = await drip.balanceOf(signer.address);
    expect(dripBalance.toNumber()).to.equal(0);

    // increase block time to simulate a drip
    const oneDay = 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [oneDay]);
    // mine a new block
    await ethers.provider.send("evm_mine", []);

    // check new balance
    const dripBalance2 = await drip.balanceOf(signer.address);
    expect(dripBalance2.toNumber()).to.be.greaterThan(dripBalance.toNumber());
  });
});
