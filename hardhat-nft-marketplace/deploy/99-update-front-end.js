const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontEndContractsFile = "../nextjs-nft-marketplace/constants/networkMapping.json"
const frontEndAbiLocation = "../nextjs-nft-marketplace/constants/"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating fornt end...")
        await upddateContractAddresses()
        await updateABI()
    }
}
async function updateABI() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function upddateContractAddresses() {
    const nftMarketPlace = await ethers.getContract("NftMarketplace")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketPlace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketPlace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketPlace.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
