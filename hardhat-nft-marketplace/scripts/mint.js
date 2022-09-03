const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.utils.parseEther("0.1")

async function mint() {
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting")

    const mintingTx = await basicNft.mintNft()
    const mintingTxReceipt = await mintingTx.wait(1)
    const tokenId = mintingTxReceipt.events[0].args.tokenId.toString()
    console.log("Minted")

    console.log("owner, ", await basicNft.ownerOf(tokenId))
    console.log("Token ID: ", tokenId)
    console.log("NFT address, ", basicNft.address)

    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mint()
