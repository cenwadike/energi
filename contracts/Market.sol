// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable owner;
  uint256 listingPrice = 0.025 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
    uint deadline;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold,
    uint deadline
  );

  /* Returns the listing price of the contract */
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }
  
  /* Places an auction for sale on the auction marketplace */
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();
    uint deadline = block.timestamp + 15 minutes;

    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false,
      deadline
    );

    if(deadline < block.timestamp) {
      delete idToMarketItem[itemId];
      _itemsSold.increment();
    }
    
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false,
      deadline
    );
  }

  /* Place bid on item */
  /* Transfers ownership of the item, as well as funds between parties after deadline */
  //TODO: modulate this function    
  function createMarketSale(
    address nftContract,
    uint256 itemId,
    uint256 bid
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    uint deadline = idToMarketItem[itemId].deadline;
    uint bidCounter = 0;
    uint bidderCounter = 0;

    require(msg.sender.balance >= price, "Insufficient funds");
    require(bid >= price, "Bid too low");
    require(deadline > block.timestamp, "The deadline has passed");

    // transfer bid to escrow
    payable(owner).transfer(bid);

    uint currentBid = 0;
    address highestBidder = address(0);
    address[] memory bidders ;
    uint256[] memory bids;

    if(bid > currentBid) {
      currentBid = bid;
      highestBidder = msg.sender;
    }
    bidders[bidderCounter] = msg.sender;
    bidderCounter++;
    bids[bidCounter] = bid;
    bidCounter++;

    if(deadline < block.timestamp) {
      idToMarketItem[itemId].seller.transfer(currentBid);
      IERC721(nftContract).transferFrom(address(this), highestBidder, tokenId);
      idToMarketItem[itemId].owner = payable(highestBidder);
      idToMarketItem[itemId].sold = true;
      _itemsSold.increment();
      payable(owner).transfer(listingPrice);

      // loop through bidders and pay them back
      for(uint i = 0; i < bidders.length; i++) {
        if(bidders[i] != highestBidder) {
          payable(bidders[i]).transfer(bids[i]);
        }
      }

      delete idToMarketItem[itemId];
    }
  }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)
        && idToMarketItem[i + 1].sold == false 
        && idToMarketItem[i + 1].deadline > block.timestamp) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns onlyl items that a user has purchased */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender
        && idToMarketItem[i + 1].sold == false 
        && idToMarketItem[i + 1].deadline > block.timestamp
      ) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}