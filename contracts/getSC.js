const axios = require('axios');
const Web3 = require('web3');

// Replace with your Ganache RPC endpoint
const JSON_RPC_ENDPOINT = 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(JSON_RPC_ENDPOINT));

// Fetch block by number
async function getBlockByNumber(blockNumber) {
    try {
        const response = await axios.post(JSON_RPC_ENDPOINT, {
            jsonrpc: "2.0",
            method: "eth_getBlockByNumber",
            params: [blockNumber, true], // true to include transactions
            id: 1
        });
        return response.data.result;
    } catch (error) {
        console.error(`Error fetching block ${blockNumber}:`, error.message);
        return null;
    }
}

// Fetch transaction receipt
async function getTransactionReceipt(txHash) {
    try {
        const response = await axios.post(JSON_RPC_ENDPOINT, {
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [txHash],
            id: 1
        });
        return response.data.result;
    } catch (error) {
        console.error(`Error fetching receipt for transaction ${txHash}:`, error.message);
        return null;
    }
}

// Fetch contract name by calling name() function
async function getContractName(contractAddress) {
    try {
        const contractInstance = new web3.eth.Contract([], contractAddress); // Empty ABI to call any function
        const name = await contractInstance.methods.name().call();
        return name;
    } catch (error) {
        console.error(`Error fetching name for contract ${contractAddress}:`, error.message);
        return "Unknown";
    }
}

// Scan the blockchain for deployed contracts
async function getDeployedContracts() {
    const deployedContracts = [];

    try {
        // Get the latest block number
        const latestBlockResponse = await axios.post(JSON_RPC_ENDPOINT, {
            jsonrpc: "2.0",
            method: "eth_blockNumber",
            params: [],
            id: 1
        });
        const latestBlockHex = latestBlockResponse.data.result;
        const latestBlockNumber = parseInt(latestBlockHex, 16);

        console.log(`Scanning blocks from 0 to ${latestBlockNumber}...`);

        // Loop through all blocks
        for (let i = 0; i <= latestBlockNumber; i++) {
            const blockHex = `0x${i.toString(16)}`;
            const block = await getBlockByNumber(blockHex);

            if (block && block.transactions) {
                for (const tx of block.transactions) {
                    // Check if it's a contract creation transaction (to is null)
                    if (!tx.to) {
                        const receipt = await getTransactionReceipt(tx.hash);
                        if (receipt && receipt.contractAddress) {
                            const name = await getContractName(receipt.contractAddress);
                            deployedContracts.push({
                                contractAddress: receipt.contractAddress,
                                contractName: name,
                                transactionHash: tx.hash
                            });
                        } else {
                            console.error(`No contract address found for transaction ${tx.hash}`);
                        }
                    }
                }
            }
        }

        console.log("Deployed Contracts:", deployedContracts);
        return deployedContracts;
    } catch (error) {
        console.error("Error scanning blockchain:", error.message);
        return [];
    }
}

// Main function
async function main() {
    const deployedContracts = await getDeployedContracts();
    console.log("All Deployed Contracts:");
    deployedContracts.forEach((contract, index) => {
        console.log(`${index + 1}. Contract Address: ${contract.contractAddress}, Contract Name: ${contract.contractName}, Transaction Hash: ${contract.transactionHash}`);
    });
}

main();

