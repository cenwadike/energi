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
  const [formInput, updateFormInput] = useState({ bid: '' })
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
  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    setShowModal(false)
    const bid = ethers.utils.parseEther(formInput.bid)
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
                    <button className="w-full bg-purple-500 text-white font-bold py-2 px-12 rounded" type='button' data-modal-toggle="bid-modal" onClick={() => setShowModal(true)}>Place Bid</button>
                    {modal ? (
                      <div id="bid-modal" aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed right-0 left-0 top-4 z-50 flex justify-center items-center h-modal md:h-full md:inset-0">
                        <div className="relative px-4 w-full max-w-md h-full md:h-auto">
                          <div className="relative bg-purple-200 rounded-lg shadow">
                            <div className="flex justify-end p-2">
                              <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="bid-modal" onClick={() => setShowModal(false)}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                              </button>
                            </div>
                            <form className="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
                              <h3 className="text-xl font-semibold text-indigo-600 dark:text-white text-center">Make your bid</h3>
                              <div className="flex justify-center">
                                <label htmlFor="auction-name" className="block mb-2 text-lg font-semibold text-indigo-600 dark:text-gray-300">{nft.name}</label>
                              </div>
                              <div>
                                <label htmlFor="auction-bid" className="block mb-2 text-sm font-medium text-indigo-600 dark:text-gray-300">Your Bid</label>
                                <input type="text" name="bid" id="bid" className="bg-gray-50 border border-gray-300 text-purple-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="10" required=""
                                  onChange={e => updateFormInput({ ...formInput, bid: e.target.value })} />
                              </div>
                              <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={() => buyNft(nft)}>Submit</button>
                            </form>

                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div >
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
