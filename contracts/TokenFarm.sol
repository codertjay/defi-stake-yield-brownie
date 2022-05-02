// SPDX-License-Identifier:MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


// 100 ETH  1:1 for every 1 ETH, we give 1 Dapptoken
// 50 ETH and 50 DAI staked, and we want to give a reward of 1 DApp / 1 DAI

contract TokenFarm is Ownable {
    //    mapping token address -> staker address -> _amount
    mapping(address => mapping(
    address => uint256)) public stakingBalance;
    mapping(address => uint256) public uniqueTokensStaked;
    mapping(address => address) public tokenPriceFeedMapping;
    address[] public allowedTokens;
    
    address[] public stakers;
    IERC20 public  dappToken;
    
    //    stakeTokens ->Done
    //    unStakeTokens
    //    issueTokens  ->Done
    //    addAllowedTokens  ->Done
    //    getEthValues  ->Done
    
    constructor(address _dappTokenAddress) {
        dappToken = IERC20(_dappTokenAddress);
    }
    
    function setPriceFeedContract(address _token, address _priceFeed)
    public onlyOwner
    {
        tokenPriceFeedMapping[_token] = _priceFeed;
    }
    
    function stakeTokens(uint256 _amount, address _token) public {
        //        what tokens can they take
        //        how much can they stake
        require(_amount > 0, "Amount must be greater than zero");
        require(tokenIsAllowed(_token),
            "Token is not currently not allowed");
        //        transferFromToken
        IERC20(_token).transferFrom(
            msg.sender, address(this), _amount);
        updateUniqueTokensStaked(msg.sender, _token);
        stakingBalance[_token][msg.sender] += _amount;
        
        if (uniqueTokensStaked[msg.sender] == 1) {
            stakers.push(msg.sender);
        }
        
    }
    
    // Issuing Tokens
    function issueTokens() public onlyOwner {
        // Issue tokens to all stakers
        for (
            uint256 stakersIndex = 0;
            stakersIndex < stakers.length;
            stakersIndex++
        ) {
            address recipient = stakers[stakersIndex];
            dappToken.transfer(recipient, getUserTotalValue(recipient));
        }
    }
    
    
    // todo: add reentrancy
    function unStakeTokens(address _token) public {
        // Fetch staking balance
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "staking balance cannot be 0");
        IERC20(_token).transfer(msg.sender, balance);
        stakingBalance[_token][msg.sender] = 0;
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
        
    }
    
    function getUserTotalValue(address _user)
    public view returns (uint256){
        uint256 totalValue = 0;
        require(uniqueTokensStaked[_user] > 0, "No tokens staked!");
        for (uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length; allowedTokensIndex ++) {
            uint256 totalValue = totalValue + getUserSingleTokenValue(
                _user, allowedTokens[allowedTokensIndex]);
        }
        return totalValue;
    }
    
    function getUserSingleTokenValue(address _user, address _token)
    public view returns (uint256)
    {
        // 1 ETH -> $2,000
        // 2000
        // 200 DAI -> $200
        if (uniqueTokensStaked[_user] <= 0) {
            return 0;
        }
        //  price of the token * stakingBalance[_token[[user]
        (uint256 price, uint256 decimals) = getTokenValue(_token);
        return (
        stakingBalance[_token][_user] * price / (10 ** decimals));
        
    }
    
    function getTokenValue(address _token)
    public view returns (uint256, uint256)
        // price Feed Address
    {
        address priceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (,int256 price,,,) = priceFeed.latestRoundData();
        uint256 decimals = priceFeed.decimals();
        return (uint256(price), uint256(decimals));
    }
    
    
    function updateUniqueTokensStaked(
        address _user,
        address _token)
    internal {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
            
        }
    }
    
    
    function addAllowedTokens(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }
    
    function tokenIsAllowed(address _token) public returns (bool){
        for (uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++) {
            if (allowedTokens[allowedTokensIndex] == _token) {
                return true;
            }
        }
        return false;
    }
}

