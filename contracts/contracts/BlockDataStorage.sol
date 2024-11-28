// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionInfoStorage {

    address public allowedAddress;

    struct TransactionInfo {
        string networkID;
        string chainID;
        string blockNumber;
        string transactionHash;
        string blockHash;
        string timeStamp;
        string[] validators;
    }

    mapping(uint256 => TransactionInfo) public transactions;
    uint256 public transactionCount;

    event TransactionStored(
        uint256 indexed transactionID,
        string networkID,
        string chainID,
        string blockNumber,
        string transactionHash,
        string blockHash,
        string timeStamp,
        string[] validators
    );

    modifier onlyAllowed() {
        require(msg.sender == allowedAddress, "Not authorized to store information.");
        _;
    }

    constructor() {
        allowedAddress = msg.sender; // Automatically set the deployer as allowedAddress
    }

    function storeTransactionInfo(
        string memory _networkID,
        string memory _chainID,
        string memory _blockNumber,
        string memory _transactionHash,
        string memory _blockHash,
        string memory _timeStamp,
        string[] memory _validators
    ) public onlyAllowed {
        transactions[transactionCount] = TransactionInfo({
            networkID: _networkID,
            chainID: _chainID,
            blockNumber: _blockNumber,
            transactionHash: _transactionHash,
            blockHash: _blockHash,
            timeStamp: _timeStamp,
            validators: _validators
        });

        emit TransactionStored(
            transactionCount,
            _networkID,
            _chainID,
            _blockNumber,
            _transactionHash,
            _blockHash,
            _timeStamp,
            _validators
        );

        transactionCount++;
    }

    function getTransactionInfo(uint256 transactionID)
        public
        view
        returns (
            string memory networkID,
            string memory chainID,
            string memory blockNumber,
            string memory transactionHash,
            string memory blockHash,
            string memory timeStamp,
            string[] memory validators
        )
    {
        TransactionInfo memory transaction = transactions[transactionID];
        return (
            transaction.networkID,
            transaction.chainID,
            transaction.blockNumber,
            transaction.transactionHash,
            transaction.blockHash,
            transaction.timeStamp,
            transaction.validators
        );
    }

    function updateAllowedAddress(address _newAllowedAddress) public onlyAllowed {
        allowedAddress = _newAllowedAddress;
    }
}

