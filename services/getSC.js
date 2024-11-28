const axios = require('axios');
const {Web3} = require('web3');
const web3 = new Web3();

// Replace with your JSON-RPC endpoint
const JSON_RPC_ENDPOINT = 'http://192.168.169.133:8545';

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

// Calculate contract address
function calculateContractAddress(from, nonce) {
    return web3.utils.toChecksumAddress(
        '0x' +
        web3.utils.keccak256(web3.eth.abi.encodeParameters(['address', 'uint256'], [from, nonce])).substr(26)
    );
}

// Scan the blockchain for deployed contracts
async function getDeployedContracts() {
    let blockNumber = "0x0"; // Start from the genesis block
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
                    // Check if it's a contract creation transaction
                    if (!tx.to) {
                        const contractAddress = tx.creates || calculateContractAddress(tx.from, tx.nonce);
                        deployedContracts.push({
                            contractAddress,
                            transactionHash: tx.hash
                        });
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
        console.log(`${index + 1}. Contract Address: ${contract.contractAddress}, Transaction Hash: ${contract.transactionHash}`);
    });
}

main();

