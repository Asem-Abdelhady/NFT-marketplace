import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import nftAbi from "../constants/BasicNft.json"
import { Button, Form, useNotification } from "web3uikit"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { useEffect, useState } from "react"

export default function Home() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const contractAddresses = require("../constants/networkMapping.json")
    const marketplaceAddress = contractAddresses[chainString].NftMarketplace[0]

    const [proceeds, setProceeds] = useState("0")

    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()

    async function approveAndList(data) {
        console.log("Approving the address...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => console.log(error),
        })
    }
    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("listing the item")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess(tx) {
        tx.wait(1)
        dispatch({
            type: "success",
            message: "NFT listed",
            position: "topR",
        })
    }

    async function retrieveProceeds() {
        const proceedsFromContract = await runContractFunction({
            params: {
                contractAddress: marketplaceAddress,
                abi: nftMarketplaceAbi,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
                onError: (error) => console.log(error),
            },
        })

        if (proceedsFromContract) {
            setProceeds(proceedsFromContract.toString())
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) retrieveProceeds()
    }, [proceeds, account, isWeb3Enabled, chainId])

    async function withdraw() {
        runContractFunction({
            params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "withdrawProceeds",
                params: {},
            },
            onError: (error) => console.log(error),
            onSuccess: handleWithdrawSuccess,
        })
    }

    async function handleWithdrawSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "topR",
        })
    }

    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "Nft Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Sell your NFT here!"
                id="Main Form"
                buttonConfig={{ theme: "primary" }}
            ></Form>

            <div className="container px-4">
                <div className="py-4">
                    Your proceeds are: {ethers.utils.formatUnits(proceeds, "ether").toString()}
                </div>
                {proceeds != "0" ? (
                    <div>
                        <Button theme="primary" onClick={withdraw} text="Withdraw"></Button>
                    </div>
                ) : (
                    <div>No proceeds to withdraw</div>
                )}
            </div>
        </div>
    )
}
