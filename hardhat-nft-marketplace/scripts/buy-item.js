const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 1
async function buyItem() {
    const nftMarketPlace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const price = (await nftMarketPlace.getListing(basicNft.address, TOKEN_ID)).price.toString()
    const tx = await nftMarketPlace.buyItem(basicNft.address, TOKEN_ID, { value: price })
    await tx.wait(1)
    console.log("Nft bought!")
    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

buyItem()
