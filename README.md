# NFT-marketplace

NFT-marektplace is marketplace supportd on rinkeby testnet for the sole purpose of learning. There are 2 versions of the marketplace. The first one using moralis centralised server to sync the events emitted by the blockchain. The other one using The graph as decentrialised system to organize and index blockchain data from the marketplace smart contract I made. The deployed marketplace is using [The graph](https://github.com/Asem-Abdelhady/NFT-marketplace/tree/master/nextjs-nft-marketplace-theGraph). However, if you want to deploy your own version using the implementation of [Moralis](https://github.com/Asem-Abdelhady/NFT-marketplace/tree/master/nextjs-nft-marketplace-moralis) feel free to try.

## Installation 
To work with the project in your machine you can clone the repository and install the packages using **yarn** or **npm**

```bash
npm install
```

## Usage
To be able to use the blockchain part you can run the scripts I made to interact with it. Please note that you will have to change to ***env*** file and [hardhat config](https://github.com/Asem-Abdelhady/NFT-marketplace/blob/master/hardhat-nft-marketplace/hardhat.config.js). To mint and list and nft you can:  

```bash
yarn hardhat run ./scripts/mint-and-list.js --network localhost
```
You can also buy an NFT from different account using:

```bash
yarn hardhat run ./scripts/buy-item.js --network localhost
```
if you want to interactively deal with the marktplace in your local host you can either go to the [Moralis version](https://github.com/Asem-Abdelhady/NFT-marketplace/tree/master/nextjs-nft-marketplace-moralis) but don't forget to change the ***env*** file for your moralis configurations. Now, run the hardhat node from from the [hardhat directory](https://github.com/Asem-Abdelhady/NFT-marketplace/tree/master/hardhat-nft-marketplace)
```
yarn hardhat node
```
in a new bash
```bash
yarn moralis:sync
```
in a new bash for the next.js to run
```bash
npm run dev
```
## Visuals
To access the Marketplace on the rinkeby testnet using [The graph](https://github.com/Asem-Abdelhady/NFT-marketplace/tree/master/nextjs-nft-marketplace-theGraph) version, go to [https://nft-marketplace-ten-khaki.vercel.app/](https://nft-marketplace-ten-khaki.vercel.app/). **Please note because it is a testnet most of operations take around 1 minute to mint the transactions**. You should be able to see the home screen where the listed NFTs are:
![image](https://user-images.githubusercontent.com/40506647/188311371-1c83c84a-11c8-4224-827f-a503a4dd3c70.png)  

You can buy nfts you don't own by simply clicking  on it then make a trasnaction using meta mask then you will notice that the nft disappeared from the marketplace affter refreshing.

If you own a nft which you listed in the marketplace you can update its price by clicking on it:
![image](https://user-images.githubusercontent.com/40506647/188311625-5dad2885-524c-4d92-a438-be84168dd3ee.png)

To sell an NFT you own go to sell NFT:
![image](https://user-images.githubusercontent.com/40506647/188311778-fbc76e77-f90e-4899-aa56-4ec33ccd0c89.png)

Put the NFT address for your NFT and its token id. You are free to choose whateer price you want. If someone already bought a NFT you lsited you will see the balance in proceeds where you can withdraw them anytime you want. 
## Acknowledgment
This marketplace is simply me following the [Patrick](https://github.com/PatrickAlphaC) in his course. I appreciate his dedication to teach the community Ethereum principles.
