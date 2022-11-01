

import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import dotenv from 'dotenv'
import { writeFile } from 'fs/promises'
dotenv.config()

const chain = EvmChain.ETHEREUM;
const address = process.env.TARGET_CONTRACT || "";
const ownersSet = new Set()

const recursiveGetOwners = async (lastResponse: any) => {
    lastResponse.result.map((r: any) => r.ownerOf && ownersSet.add(r.ownerOf.checksum));
    if (lastResponse.hasNext()) {
        let resp = await lastResponse.next()
        if (resp.hasNext()) {
            await recursiveGetOwners(resp)
        } else {
            resp.result.map((r: any) => r.ownerOf && ownersSet.add(r.ownerOf.checksum));
        }

    }
}

const main = async () => {
    await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY || "",
    });

    const initialResponse = await Moralis.EvmApi.nft.getNFTOwners({
        address,
        chain,
    });
    await recursiveGetOwners(initialResponse)

    console.log(ownersSet)
    console.log(ownersSet.values.length)

    await writeFile("./owners.json", JSON.stringify([...ownersSet]))



}

main().then(() => {
    console.log("done")
}).catch((err: any) => {
    console.log("error")
    console.log(err)
})