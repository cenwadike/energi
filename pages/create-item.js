import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifact/NFT.json'
import Market from '../artifact/NFTMarket.json'

export default function CreateItem() {
  const [formInput, updateFormInput] = useState({ price: '', name: '', amount: '' })
  const router = useRouter()

  async function createMarket() {
    const { name, amount, price } = formInput
    if (!name || !amount || !price ) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, amount
    }) 
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    
    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')
  
    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    router.push('/marketplace')
  }

  return(
    <div className="mt-auto">
      <main>
        <div className="py-6 md:py-12">
          <div className="px-4 mt-20 flex justify-center">
            <form className="w-full max-w-sm">
              <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                  <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" 
                         htmlFor="inline-full-name">
                    Auction Name   
                  </label>
                </div>
                <div className="md:w-2/3">
                  <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" 
                         id="auction_name" 
                         type="text" 
                         placeholder="Auction_Name"
                         onChange={e => updateFormInput ({ ...formInput, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                  <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" 
                         htmlFor="energe_quantity">
                    Amount (KWh)
                  </label>
                </div>
                <div className="md:w-2/3">
                  <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" 
                         id="quantity" 
                         type="number" 
                         placeholder="250"
                         onChange={ e => updateFormInput ({ ...formInput, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="md:flex md:items-center mb-6">
                <div className="md:w-1/3">
                  <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" 
                         htmlFor="starting_price">
                    Price(MATIC)
                  </label>
                </div>
                <div className="md:w-2/3">
                  <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" 
                         id="price" 
                         type="number" 
                         placeholder="10"
                         onChange={ e => updateFormInput ({ ...formInput, price: e.target.value})}
                  />
                </div>
              </div>
              <div className="md:flex md:items-center">
                <div className="md:w-1/3"></div>
                <div className="flex justify-center">
                  <Link href="/marketplace">
                    <a>
                      <button onClick={ createMarket } 
                              className="shadow bg-indigo-600 hover:bg-indigo-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded-lg" 
                              type="button"
                      >
                      Auction Energy
                    </button>
                    </a>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>  
      </main>
    </div>
  )
}