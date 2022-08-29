const { expect, assert } = require("chai")

const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMarketplace", function () {
          let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract
          const BN = require("bn.js")
          const TOKEN_ID = 0
          const PRICE = ethers.utils.parseEther("0.1")
          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]
              await deployments.fixture(["all"])
              nftMarketplaceContract = await ethers.getContract("NftMarketplace")
              nftMarketplace = nftMarketplaceContract.connect(deployer)
              basicNftContract = await ethers.getContract("BasicNft")
              basicNft = await basicNftContract.connect(deployer)
              await basicNft.mintNft()
              await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
          })

          describe("listItem", function () {
              it("reverts when price is 0", async function () {
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, 0)
                  ).to.be.revertedWith("NftMarketplace__NftPriceShouldBeAboceZero")
              })

              it("reverts when not owner", async function () {
                  const userMarketplace = nftMarketplaceContract.connect(user)
                  await expect(
                      userMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotNftOwner")
              })

              it("reverts when listed already", async function () {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NftMarketplace__AlreadyListed")
              })

              it("lists the item correctly", async function () {
                  const tx = await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const txReceipt = await tx.wait(1)
                  const seller = txReceipt.events[0].args.seller

                  assert.equal(seller, deployer.address)
              })
          })

          describe("Buy Item", function () {
              beforeEach(async function () {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
              })

              it("Reverts when price is not met", async function () {
                  await expect(
                      nftMarketplaceContract.connect(user).buyItem(basicNft.address, TOKEN_ID, {
                          value: ethers.utils.parseEther("0.01"),
                      })
                  ).to.be.revertedWith("NftMarketplace__PriceNotMet")
              })

              it("Changes owner when bought", async function () {
                  await nftMarketplaceContract
                      .connect(user)
                      .buyItem(basicNft.address, TOKEN_ID, { value: PRICE })

                  const owner = await basicNft.ownerOf(TOKEN_ID)
                  assert.equal(owner.toString(), user.address)
              })

              it("Get deleted from the market", async function () {
                  await nftMarketplaceContract
                      .connect(user)
                      .buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  const itemPriceAfter = (
                      await nftMarketplaceContract.getListing(basicNft.address, TOKEN_ID)
                  ).price.toString()

                  assert.equal(itemPriceAfter, "0")
              })

              it("Updates the proceed when bought", async function () {
                  await nftMarketplaceContract
                      .connect(user)
                      .buyItem(basicNft.address, TOKEN_ID, { value: PRICE })

                  const proceeds = await nftMarketplace.getProceeds(deployer.address)
                  assert(proceeds.toString(), PRICE.toString())
              })

              it("emits event when finished", async function () {
                  const tx = await nftMarketplaceContract
                      .connect(user)
                      .buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  const txReceipt = await tx.wait(1)
                  const owner = txReceipt.events[2].args.buyer
                  assert.equal(owner.toString(), user.address)
              })
          })
          describe("cancelListing", function () {
              beforeEach(async function () {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
              })

              it("ٌReverts when not owner", async function () {
                  await expect(
                      nftMarketplaceContract
                          .connect(user)
                          .cancelListing(basicNftContract.address, TOKEN_ID)
                  ).to.be.revertedWith("NftMarketplace__NotNftOwner")
              })

              it("Cancel the item correctly", async function () {
                  const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  const itemPriceAfterCancellation = (
                      await nftMarketplaceContract.getListing(basicNft.address, TOKEN_ID)
                  ).price.toString()
                  const txReceipt = await tx.wait(1)
                  const nftAddress = txReceipt.events[0].args.nftAddress
                  assert.equal(itemPriceAfterCancellation.toString(), "0")
                  assert.equal(nftAddress.toString(), basicNft.address)
              })
          })

          describe("updateItemPrice", function () {
              let newPrice
              beforeEach(async function () {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  newPrice = ethers.utils.parseEther("0.01")
              })

              it("ٌReverts when not owner", async function () {
                  await expect(
                      nftMarketplaceContract
                          .connect(user)
                          .updateItemPrice(basicNftContract.address, TOKEN_ID, newPrice)
                  ).to.be.revertedWith("NftMarketplace__NotNftOwner")
              })
              it("Updates the price correctly", async function () {
                  const tx = await nftMarketplace.updateItemPrice(
                      basicNftContract.address,
                      TOKEN_ID,
                      newPrice
                  )
                  const itemPriceAfterUpdate = (
                      await nftMarketplaceContract.getListing(basicNft.address, TOKEN_ID)
                  ).price.toString()
                  const txReceipt = await tx.wait(1)
                  const newPriceFromEvent = txReceipt.events[0].args.price

                  assert.equal(itemPriceAfterUpdate, newPrice.toString())
                  assert.equal(newPriceFromEvent, newPrice.toString())
              })
          })

          describe("withdrawProceeds", function () {
              beforeEach(async function () {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  //   await nftMarketplaceContract
                  //       .connect(user)
                  //       .buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
              })

              it("Reverts when no proceeds", async function () {
                  await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
                      "NftMarketplace__NoProceeds"
                  )
              })

              it("Sets Proceeds to 0 after withdrawing", async function () {
                  await nftMarketplaceContract
                      .connect(user)
                      .buyItem(basicNft.address, TOKEN_ID, { value: PRICE })

                  await nftMarketplace.withdrawProceeds()
                  const proceedings = (
                      await nftMarketplace.getProceeds(deployer.address)
                  ).toString()

                  assert.equal(proceedings, "0")
              })

              it("Incerases balance of the owner after withdrawing", async function () {
                  await nftMarketplaceContract
                      .connect(user)
                      .buyItem(basicNft.address, TOKEN_ID, { value: PRICE })

                  const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address)
                  const balanceBeforeWithdrawing = await deployer.getBalance()
                  const tx = await nftMarketplace.withdrawProceeds()
                  const txReceipt = await tx.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const deployerBalanceAfter = await deployer.getBalance()

                  assert.equal(
                      deployerBalanceAfter.add(gasCost).toString(),
                      balanceBeforeWithdrawing.add(deployerProceedsBefore).toString()
                  )
              })
          })
      })
