const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0
async function cancel() {
    const nftMarketPlace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const tx = await nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("Nft canceled!")
    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

cancel()
