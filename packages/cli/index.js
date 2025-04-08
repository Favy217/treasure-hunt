const { ethers } = require("ethers");
const process = require("process");

const args = process.argv.slice(2);
const rpcUrl = args[args.indexOf("--rpc") + 1];
const privateKey = args[args.indexOf("--private-key") + 1];
const contractAddress = args[args.indexOf("--contract") + 1];
const method = args[args.indexOf("--method") + 1];
const methodArgs = args[args.indexOf("--args") + 1] ? args.slice(args.indexOf("--args") + 1) : [];

console.log("Method:", method);
console.log("Method Args:", methodArgs);

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const abi = [
    "function addTreasure(bytes32 _clueHash, uint256 _value) external",
    "function claimTreasure(uint256 _id, string _solution) external",
    "function getScore(address _player) external view returns (uint256)",
    "function getTreasure(uint256 _id) external view returns (bytes32 clueHash, address claimant, bool isClaimed)",
    "function getClueHash(string _solution) external pure returns (bytes32)"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

async function run() {
    try {
        if (method === "addTreasure(bytes32,uint256)") {
            const tx = await contract.addTreasure(methodArgs[0], methodArgs[1]);
            console.log("Transaction hash:", tx.hash);
            await tx.wait();
            console.log("Treasure added successfully");
        } else if (method === "claimTreasure(uint256,string)") {
            const tx = await contract.claimTreasure(methodArgs[0], methodArgs[1]);
            console.log("Transaction hash:", tx.hash);
            await tx.wait();
            console.log("Treasure claimed successfully");
        } else if (method === "getScore(address)") {
            const score = await contract.getScore(methodArgs[0]);
            console.log("Player score:", score.toString());
        } else if (method === "getTreasure(uint256)") {
            const [clueHash, claimant, isClaimed] = await contract.getTreasure(methodArgs[0]);
            console.log("Treasure details:", { clueHash, claimant, isClaimed });
        } else if (method === "getClueHash(string)") {
            const hash = await contract.getClueHash(methodArgs[0]);
            console.log("Computed hash:", hash);
        } else {
            console.error("Unknown method:", method);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
