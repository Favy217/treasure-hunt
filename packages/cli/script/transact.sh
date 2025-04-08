#!/bin/bash
set -e

PRIVKEY="0xfe7ace135f5ecf63a5cab2b44acfaffae4a318e7444a29ebda3fc90ea5911e9f"
CONTRACT_ADDRESS="0x59E8D0d2319F5d23749e38346E3F2e00C5828b55"
RPC_URL="https://node-2.seismicdev.net/rpc"
EXPLORER_URL="https://explorer-2.seismicdev.net"

echo "Interacting with TreasureHunt at: $CONTRACT_ADDRESS"

# Step 1: Check treasure #8 details (added via cast)
echo "Checking treasure #8 details..."
bun run index.js --rpc "$RPC_URL" \
                 --private-key "$PRIVKEY" \
                 --contract "$CONTRACT_ADDRESS" \
                 --method "getTreasure(uint256)" \
                 --args "8"

# Step 2: Claim treasure #8
echo "Claiming treasure #8 with solution 'secret'..."
bun run index.js --rpc "$RPC_URL" \
                 --private-key "$PRIVKEY" \
                 --contract "$CONTRACT_ADDRESS" \
                 --method "claimTreasure(uint256,string)" \
                 --args "8" "secret"

# Step 3: Check score
echo "Checking your score..."
bun run index.js --rpc "$RPC_URL" \
                 --private-key "$PRIVKEY" \
                 --contract "$CONTRACT_ADDRESS" \
                 --method "getScore(address)" \
                 --args "0xCA01CC8979574cF0a719372C9BAa3457E40e68df"
