const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const CONTRACT_ABI = [
  "function registerUser(string memory _country) external",
  "function deposit(string memory _currency, uint256 _amount) external",
  "function withdraw(string memory _currency, uint256 _amount) external",
  "function initiateTransfer(address _recipient, string memory _fromCurrency, string memory _toCurrency, uint256 _senderAmount) external returns (uint256)",
  "function getBalance(address _user, string memory _currency) external view returns (uint256)",
  "function getTransfer(uint256 _transferId) external view returns (tuple(uint256, address, address, string, string, uint256, uint256, uint256, uint256, string))",
  "function calculateTransferAmount(string memory _fromCurrency, string memory _toCurrency, uint256 _amount) external view returns (uint256, uint256)",
  "function addToken(string memory _symbol, address _tokenAddress) external",
  "function updateExchangeRate(string memory _from, string memory _to, uint256 _rate) external",
  "function setTransferFee(uint256 _feePercentage) external"
];

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  CONTRACT_ABI,
  wallet
);

module.exports = {
  provider,
  wallet,
  contract,
  CONTRACT_ABI
};