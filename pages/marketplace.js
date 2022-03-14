import { ethers } from 'ethers'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifact/NFT.json'
import Market from '../artifact/NFTMarket.json'

let rpcEndpoint = `https://rpc-mumbai.maticvigil.com/`

export default function Home() {
  const [nfts, setNfts] = useState([])
  // const [bid, updateBid] = useState(0)
  const [modal, setShowModal] = useState(false)
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        itemId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        name: meta.data.name,
        amount: meta.data.amount,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }
  async function buyNft(nft, e) { // modify to call in modal
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    setShowModal(false)
    const bid = ethers.utils.parseUnits(e.target.value.toString(), 'ether')
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress, nft.itemId, bid, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  
  if (loadingState === 'loaded' && !nfts.length)
    return (
      <>
        <h1 className="px-10 py-20 text-3xl text-semibold text-indigo-600">No Auction Available</h1>
        <div className="mt-5 mb-10 flex w-full justify-center">
          <button className="bg-indigo-600 text-white py-2 px-6 rounded-full text-xl mt-6 hover:bg-purple-700 transition-colors duration-300">
            <Link href="/create-item">
              <a>Create an auction</a>
            </Link>
          </button>
        </div>
      </>
    )

  return (
    <>
      <div className="flex justify-center pt-10 pb-10">
        <div className="px-4 pt-12" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <div className="p-4">
                    <p style={{ height: '30px' }} className="text-2xl text-indigo-600 font-semibold">{nft.name}</p>
                    <div style={{ height: '30px', overflow: 'hidden' }}>
                      <p className="text-indigo-400">{nft.amount}KwH</p>
                    </div>
                  </div>
                  <div className="p-2 bg-black">
                    <p className="flex justify-center text-2xl mb-4 font-bold text-white">{nft.price} MATIC</p>
                    <button className="w-full bg-purple-500 text-white font-bold py-2 px-12 rounded" type='button' data-modal-toggle="defaultModal" onClick={() => setShowModal(true)}>Place Bid</button>
                    { modal ? (
                      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div class="flex justify-between items-start p-5 rounded-t border-b dark:border-gray-600">
                          <h3 class="text-xl font-semibold text-gray-900 lg:text-2xl dark:text-white">
                            Place your bid
                          </h3>
                        </div>
                        <div class="p-6 space-y-6">                    
                          <form className="w-full max-w-sm">
                            <div className="md:flex md:items-center mb-6">
                              <div className="md:w-1/3">
                                <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                                  htmlFor="inline-full-name">
                                  Auction Name
                                  <div className="md:w-2/3">
                                    <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                                      id="auction_bid"
                                      type="number"
                                      placeholder="Your bid" 
                                      (e.target.value)={updateBid)}
                                    />{/*onSubmit={(e) => buyNft(nft, e)}*/}
                                  </div>
                                </label>
                                <div class="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600">
                                <input class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                  data-modal-toggle="defaultModal" 
                                  type='submit' 
                                  value={e.target.value} 
                                  onClick={(e) => buyNft(nft, e)} />
                                </div>
                              </div>
                              
                            </div>\
                          </form>
                        </div>
                      </div>
                    ) : null }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <div className="mt-5 mb-10 flex w-full justify-center">
        <button className="bg-indigo-600 text-white py-2 px-6 rounded-full text-xl mt-6 hover:bg-purple-700 transition-colors duration-300">
          <Link href="/create-item">
            <a>Create an auction</a>
          </Link>
        </button>
      </div>
    </>
  )
}
