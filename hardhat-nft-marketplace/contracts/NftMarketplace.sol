// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NftMarketplace__NftPriceShouldBeAboceZero();
error NftMarketplace__NotApprovedForTheMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotNftOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();
error NftMarketplace__WithdrawFailed();

contract NftMarketplace {
    struct ListingItem {
        uint256 price;
        address seller;
    }

    mapping(address => mapping(uint256 => ListingItem)) private s_ListingItems;
    mapping(address => uint256) private s_proceeds;

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(address indexed owner, address indexed nftAddress, uint256 indexed tokenId);

    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        ListingItem memory listing = s_ListingItems[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isNftOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) revert NftMarketplace__NotNftOwner();
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        ListingItem memory item = s_ListingItems[nftAddress][tokenId];
        if (item.price <= 0) revert NftMarketplace__NotListed(nftAddress, tokenId);
        _;
    }

    constructor() {}

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isNftOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) revert NftMarketplace__NftPriceShouldBeAboceZero();
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForTheMarketplace();
        }

        s_ListingItems[nftAddress][tokenId] = ListingItem(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
    {
        ListingItem memory listedItem = s_ListingItems[nftAddress][tokenId];
        if (msg.value < listedItem.price)
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        s_proceeds[msg.sender] += msg.value;
        delete (s_ListingItems[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isNftOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_ListingItems[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateItemPrice(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isNftOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        s_ListingItems[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) revert NftMarketplace__NoProceeds();
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) revert NftMarketplace__WithdrawFailed();
    }
}
