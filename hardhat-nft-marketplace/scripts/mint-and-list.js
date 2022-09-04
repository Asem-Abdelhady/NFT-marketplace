const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
    const nftMarketPlace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting")

    const mintingTx = await basicNft.mintNft()
    const mintingTxReceipt = await mintingTx.wait(1)
    const tokenId = mintingTxReceipt.events[0].args.tokenId.toString()
    console.log("Minted")

    console.log("Token ID: ", tokenId)

    console.log("Approving the nft")
    const approvalTx = await basicNft.approve(nftMarketPlace.address, tokenId)
    await approvalTx.wait(1)

    console.log("Listing the nft")
    const listingTx = await nftMarketPlace.listItem(basicNft.address, tokenId, PRICE)
    await listingTx.wait(1)
    console.log("Listed")

    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mintAndList()
