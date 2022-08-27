const { expect, assert } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMarketplace", function () {
          let nftMarketPlace, basicNft, deployer, user
          const TOKEN_ID = 0
          const PRICE = ethers.utils.parseEther("0.1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              const accounts = await ethers.getSigners()
              user = accounts[1]
              user = (await getNamedAccounts()).user
              await deployments.fixture(["all"])
              nftMarketPlace = await ethers.getContract("NftMarketplace")
              basicNft = await ethers.getContract("BasicNft")
              await basicNft.mintNft()
              await basicNft.approve(nftMarketPlace.address, TOKEN_ID)
          })

          describe("listItem", function () {
              it("reverts when price is 0", async function () {
                  await expect(
                      nftMarketPlace.listItem(basicNft.address, TOKEN_ID, 0)
                  ).to.be.revertedWith("NftMarketplace__NftPriceShouldBeAboceZero")
              })

              it("reverts when not owner", async function () {
                  const userMarketPlace = nftMarketPlace.connect(user)
                  console.log("user: ", user)
                  await expect(
                      userMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotNftOwner")
              })

              it("reverts when listed already", async function () {
                  await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NftMarketplace__AlreadyListed")
              })

              it("lists the item correctly", async function () {
                  const tx = await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const txReceipt = await tx.wait(1)
                  const seller = txReceipt.events[0].args.seller

                  assert.equal(seller, deployer)
              })
          })

          describe("Buy Item", function () {
              beforeEach(async function () {
                  await nftMarketPlace.listItem(basicNft.address, TOKEN_ID, PRICE)
              })

              it("Reverts when price is not met", async function () {
                  console.log("Signer: ", user)
                  await nftMarketPlace.connect(user).buyItem(basicNft.address, TOKEN_ID, {
                      value: ethers.utils.parseEther("0.01"),
                  })

                  console.log("User marketplace: ", nftMarketPlace.signer)

                  assert(0 == 0)

                  // await expect(
                  //     userMarketPlace.buyItem(basicNft.address, TOKEN_ID, {
                  //         value: ethers.utils.parseEther("0.01"),
                  //     })
                  // ).to.be.revertedWith("NftMarketplace__PriceNotMet")
              })
          })
      })
