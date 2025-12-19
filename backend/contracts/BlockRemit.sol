// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BlockRemit
 * @dev A blockchain-based money transfer platform similar to Wise
 * Enables fast, low-cost international transfers using stablecoins
 */

contract BlockRemit is Ownable, ReentrancyGuard {
    
    // Stablecoin addresses (USDC, USDT, DAI, etc.)
    mapping(string => address) public supportedTokens;
    
    // Exchange rates (stored as rates * 10^18 for precision)
    mapping(string => mapping(string => uint256)) public exchangeRates;
    
    // User accounts and balances
    mapping(address => mapping(string => uint256)) public userBalances;
    mapping(address => bool) public registeredUsers;
    mapping(address => string) public userCountry;
    
    // Transfer history
    struct Transfer {
        uint256 id;
        address sender;
        address recipient;
        string fromCurrency;
        string toCurrency;
        uint256 senderAmount;
        uint256 recipientAmount;
        uint256 fee;
        uint256 timestamp;
        string status; // pending, completed, failed
    }
    
    mapping(uint256 => Transfer) public transfers;
    uint256 public transferCount;
    
    // Fee structure (in basis points, e.g., 50 = 0.5%)
    uint256 public transferFeePercentage = 50; // 0.5%
    uint256 public minTransferAmount = 1e18; // 1 USD equivalent
    
    // Admin and treasury
    address public treasury;
    
    // Events
    event UserRegistered(address indexed user, string country);
    event TokenAdded(string symbol, address tokenAddress);
    event ExchangeRateUpdated(string from, string to, uint256 rate);
    event TransferInitiated(uint256 indexed transferId, address indexed sender, address indexed recipient, uint256 amount);
    event TransferCompleted(uint256 indexed transferId, uint256 recipientAmount);
    event DepositReceived(address indexed user, string currency, uint256 amount);
    event WithdrawalProcessed(address indexed user, string currency, uint256 amount);
    
    constructor(address _treasury) {
        treasury = _treasury;
    }
    
    // ==================== User Management ====================
    
    /**
     * @dev Register a user with their country
     */
    function registerUser(string memory _country) external {
        require(!registeredUsers[msg.sender], "User already registered");
        registeredUsers[msg.sender] = true;
        userCountry[msg.sender] = _country;
        emit UserRegistered(msg.sender, _country);
    }
    
    /**
     * @dev Deposit funds into the platform
     */
    function deposit(string memory _currency, uint256 _amount) external nonReentrant {
        require(registeredUsers[msg.sender], "User not registered");
        require(supportedTokens[_currency] != address(0), "Currency not supported");
        require(_amount > 0, "Amount must be greater than 0");
        
        address tokenAddress = supportedTokens[_currency];
        require(IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        userBalances[msg.sender][_currency] += _amount;
        emit DepositReceived(msg.sender, _currency, _amount);
    }
    
    /**
     * @dev Withdraw funds from the platform
     */
    function withdraw(string memory _currency, uint256 _amount) external nonReentrant {
        require(registeredUsers[msg.sender], "User not registered");
        require(userBalances[msg.sender][_currency] >= _amount, "Insufficient balance");
        
        address tokenAddress = supportedTokens[_currency];
        userBalances[msg.sender][_currency] -= _amount;
        
        require(IERC20(tokenAddress).transfer(msg.sender, _amount), "Transfer failed");
        emit WithdrawalProcessed(msg.sender, _currency, _amount);
    }
    
    // ==================== Transfer Operations ====================
    
    /**
     * @dev Initiate a cross-currency transfer
     */
    function initiateTransfer(
        address _recipient,
        string memory _fromCurrency,
        string memory _toCurrency,
        uint256 _senderAmount
    ) external nonReentrant returns (uint256) {
        require(registeredUsers[msg.sender], "Sender not registered");
        require(registeredUsers[_recipient], "Recipient not registered");
        require(_senderAmount >= minTransferAmount, "Amount below minimum");
        require(userBalances[msg.sender][_fromCurrency] >= _senderAmount, "Insufficient balance");
        require(supportedTokens[_fromCurrency] != address(0), "From currency not supported");
        require(supportedTokens[_toCurrency] != address(0), "To currency not supported");
        
        // Get exchange rate
        uint256 rate = exchangeRates[_fromCurrency][_toCurrency];
        require(rate > 0, "Exchange rate not set");
        
        // Calculate recipient amount
        uint256 recipientAmount = (_senderAmount * rate) / 1e18;
        
        // Calculate fee
        uint256 fee = (_senderAmount * transferFeePercentage) / 10000;
        uint256 amountAfterFee = _senderAmount - fee;
        
        // Recalculate recipient amount after fee
        recipientAmount = (amountAfterFee * rate) / 1e18;
        
        // Deduct from sender
        userBalances[msg.sender][_fromCurrency] -= _senderAmount;
        
        // Add fee to treasury
        userBalances[treasury][_fromCurrency] += fee;
        
        // Add to recipient
        userBalances[_recipient][_toCurrency] += recipientAmount;
        
        // Record transfer
        uint256 transferId = transferCount++;
        transfers[transferId] = Transfer({
            id: transferId,
            sender: msg.sender,
            recipient: _recipient,
            fromCurrency: _fromCurrency,
            toCurrency: _toCurrency,
            senderAmount: _senderAmount,
            recipientAmount: recipientAmount,
            fee: fee,
            timestamp: block.timestamp,
            status: "completed"
        });
        
        emit TransferInitiated(transferId, msg.sender, _recipient, _senderAmount);
        emit TransferCompleted(transferId, recipientAmount);
        
        return transferId;
    }
    
    // ==================== Admin Functions ====================
    
    /**
     * @dev Add a supported token
     */
    function addToken(string memory _symbol, address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        supportedTokens[_symbol] = _tokenAddress;
        emit TokenAdded(_symbol, _tokenAddress);
    }
    
    /**
     * @dev Update exchange rate between two currencies
     */
    function updateExchangeRate(string memory _from, string memory _to, uint256 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be greater than 0");
        exchangeRates[_from][_to] = _rate;
        emit ExchangeRateUpdated(_from, _to, _rate);
    }
    
    /**
     * @dev Set transfer fee percentage
     */
    function setTransferFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        transferFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Set minimum transfer amount
     */
    function setMinTransferAmount(uint256 _minAmount) external onlyOwner {
        minTransferAmount = _minAmount;
    }
    
    /**
     * @dev Update treasury address
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        treasury = _newTreasury;
    }
    
    // ==================== View Functions ====================
    
    /**
     * @dev Get user balance in a specific currency
     */
    function getBalance(address _user, string memory _currency) external view returns (uint256) {
        return userBalances[_user][_currency];
    }
    
    /**
     * @dev Get transfer details
     */
    function getTransfer(uint256 _transferId) external view returns (Transfer memory) {
        return transfers[_transferId];
    }
    
    /**
     * @dev Calculate transfer amount with fee
     */
    function calculateTransferAmount(
        string memory _fromCurrency,
        string memory _toCurrency,
        uint256 _amount
    ) external view returns (uint256 recipientAmount, uint256 fee) {
        uint256 rate = exchangeRates[_fromCurrency][_toCurrency];
        require(rate > 0, "Exchange rate not set");
        
        fee = (_amount * transferFeePercentage) / 10000;
        uint256 amountAfterFee = _amount - fee;
        recipientAmount = (amountAfterFee * rate) / 1e18;
    }
}