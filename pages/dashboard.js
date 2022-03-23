import { ethers } from 'ethers'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifact/NFTMarket.json'
import NFT from '../artifact/NFT.json'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        name: meta.data.name,
        amount: meta.data.amount,
      }
      return item
    }))
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState('loaded')
  }
  if (loadingState === 'loaded' && !nfts.length)
    return (
      <>
        <div className='pt-12 px-5'>
          <h1 className="pt-8 text-3xl md:text-4xl text-indigo-600 font-small mb-2">
            No assets created
          </h1>
        </div>
        <div className="mt-5 flex w-full justify-center">
          <button className="bg-indigo-600 text-white py-2 px-6 rounded-full text-xl mt-6 mb-6 hover:bg-purple-700 transition-colors duration-300">
            <Link href="/create-item">
              <a>Create an auction</a>
            </Link>
          </button>
        </div>
      </>
    )
  return (
    <div className='pt-12 text-2xl md:text-4xl text-indigo-600 font-bold mb-12'>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <div className="p-4 bg-indigo-400">
                  <p className="text-2xl font-small text-white">Name - {nft.name} </p>
                </div>
                <div className="p-4 bg-indigo-400">
                  <p className="text-2xl font-small text-white">Amount - {nft.amount}KwH</p>
                </div>
                <div className="p-4 bg-indigo-500">
                  <p className="text-2xl font-small text-white">Price - {nft.price} Matic</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="px-4">
        {
          Boolean(sold.length) && (
            <div>
              <h2 className="text-2xl py-2">Items sold</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  sold.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                      <img src={nft.image} className="rounded" />
                      <div className="p-4 bg-indigo-400">
                        <p className="text-2xl font-small text-white">Price - {nft.price} Matic</p>
                      </div>
                      <div className="p-4 bg-indigo-400">
                        <p className="text-2xl font-small text-white">Amount - {nft.amount}</p>
                      </div>
                      <div className="p-4 bg-indigo-500">
                        <p className="text-2xl font-small text-white">Name - {nft.name} KwH</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}