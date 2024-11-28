const { Web3 } = require('web3');
const axios = require("axios");
const WebSocket = require("ws");
const ethers = require("ethers"); // For signing transactions
const log = require("loglevel");

// Configure logging
log.setLevel("info");

// WebSocket and HTTP URLs for source Besu node
const WS_URL = "ws://192.168.169.133:8546";
const HTTP_URL = "http://192.168.169.133:8545";
const DEST_BESU_URL = "http://192.168.169.133:8585";

// Set up Web3 instances
const web3Source = new Web3(new Web3.providers.HttpProvider(HTTP_URL));
const web3Dest = new Web3(new Web3.providers.HttpProvider(DEST_BESU_URL));

// Check connectivity
(async () => {
  try {
    const isConnectedSource = await web3Source.eth.net.isListening();
    const isConnectedDest = await web3Dest.eth.net.isListening();

    log.info(`Connected to source Besu network: ${isConnectedSource}`);
    log.info(`Connected to destination Besu network: ${isConnectedDest}`);
  } catch (error) {
    log.error("Connection error:", error);
  }
})();


const CONTRACT_ADDRESS = "0x42699A7612A82f1d9C36148af9C77354759b210b";
const ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "transactionID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "networkID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "chainID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "blockNumber",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "transactionHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "blockHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "timeStamp",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string[]",
          "name": "validators",
          "type": "string[]"
        }
      ],
      "name": "TransactionStored",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "allowedAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "transactionCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "transactions",
      "outputs": [
        {
          "internalType": "string",
          "name": "networkID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "chainID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "blockNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "transactionHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "blockHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "timeStamp",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_networkID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_chainID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_blockNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_transactionHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_blockHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_timeStamp",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "_validators",
          "type": "string[]"
        }
      ],
      "name": "storeTransactionInfo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "transactionID",
          "type": "uint256"
        }
      ],
      "name": "getTransactionInfo",
      "outputs": [
        {
          "internalType": "string",
          "name": "networkID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "chainID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "blockNumber",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "transactionHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "blockHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "timeStamp",
          "type": "string"
        },
        {
          "internalType": "string[]",
          "name": "validators",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_newAllowedAddress",
          "type": "address"
        }
      ],
      "name": "updateAllowedAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// Fetch block details using HTTP JSON-RPC
const getBlockByHash = async (blockHash) => {
  log.debug(`Fetching block data for hash: ${blockHash}`);
  const payload = {
    jsonrpc: "2.0",
    method: "eth_getBlockByHash",
    params: [blockHash, true],
    id: 53,
  };

  try {
    const response = await axios.post(HTTP_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    log.error(`Error fetching block by hash: ${error.message}`);
    return null;
  }
};

// Send block data to the contract on the destination network
const sendDataToContract = async (blockInfo, transactionHash) => {
  try {
    log.debug(`Preparing to send data to contract for transaction: ${transactionHash}`);
    const contract = new web3Dest.eth.Contract(ABI, CONTRACT_ADDRESS);
	const privateKey = "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";
    // Account setup
   const account = web3Dest.eth.accounts.privateKeyToAccount(privateKey);


   console.log(`Using account address: ${account.address}`);

    const txData = contract.methods.storeTransactionInfo(
      String(blockInfo.networkId),
      String(blockInfo.chainId),
      String(blockInfo.number),
      transactionHash,
      blockInfo.hash,
      String(blockInfo.timestamp),
      blockInfo.validators.map(String)
    ).encodeABI();

    const tx = {
      to: CONTRACT_ADDRESS,
      data: txData,
      from: account.address,
      gas: 3000000,
      gasPrice: "0", // Free gas network
      chainId: 1338, // Destination chain ID
    };

    const signedTx = await web3Dest.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3Dest.eth.sendSignedTransaction(signedTx.rawTransaction);

    log.info(`Sent transaction with hash: ${receipt.transactionHash}`);
  } catch (error) {
    log.error(`An error occurred while sending data to contract: ${error.message}`);
  }
};

// Process block data and send it to the contract
const processBlockData = async (blockData) => {
  const blockInfo = blockData.result;
  if (blockInfo) {
    log.debug(`Processing block data: ${JSON.stringify(blockInfo, null, 2)}`);
    blockInfo.networkId = await web3Source.eth.net.getId();
    blockInfo.chainId = parseInt(blockInfo.number, 16);
    blockInfo.timestamp = parseInt(blockInfo.timestamp, 16);
    blockInfo.validators = []; // Add actual validators if needed

    log.info(`Processing block ${blockInfo.number}`);
    for (const transaction of blockInfo.transactions) {
      const transactionHash = transaction.hash;
      log.info(`Processing transaction ${transactionHash}`);
      await sendDataToContract(blockInfo, transactionHash);
    }
  } else {
    log.error("No block data found to process.");
  }
};

// Listen for new blocks over WebSocket
const listenForNewBlocks = async () => {
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    const subscriptionRequest = {
      jsonrpc: "2.0",
      method: "eth_subscribe",
      params: ["newHeads"],
      id: 1,
    };
    ws.send(JSON.stringify(subscriptionRequest));
    log.info("Subscribed to new block headers...");
  });

  ws.on("message", async (data) => {
    const message = JSON.parse(data);
    if (message.method === "eth_subscription") {
      const blockHash = message.params.result.hash;
      log.info(`New block detected with hash: ${blockHash}`);
      const blockData = await getBlockByHash(blockHash);
      if (blockData) {
        await processBlockData(blockData);
      } else {
        log.error(`Failed to retrieve data for block hash: ${blockHash}`);
      }
    }
  });

  ws.on("error", (error) => {
    log.error(`WebSocket error: ${error.message}`);
  });

  ws.on("close", () => {
    log.error("WebSocket connection closed.");
  });
};

// Start the WebSocket listener
listenForNewBlocks();

