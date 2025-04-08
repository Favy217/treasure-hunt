#!/bin/bash
set -e
source ../../config.sh
source ../common/print.sh
# Removed wallet.sh since we're hardcoding the key

CONTRACT_PATH="src/TreasureHunt.sol:TreasureHunt"
DEPLOY_FILE="out/deploy.txt"  

prelude() {
    echo -e "${BLUE}Deploying Encrypted Treasure Hunt contract.${NC}"
    echo -e "Treasures are encrypted; solve clues to claim them!"
    echo -ne "Press Enter to continue..."
    read -r
}

prelude

# Use your address (derived from PRIVKEY) as the deployer
print_step "4" "Deploying contract with your wallet"
deploy_output=$(sforge create \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVKEY" \
    --broadcast \
    "$CONTRACT_PATH")
print_success "Success."

print_step "5" "Summarizing deployment"
contract_address=$(echo "$deploy_output" | grep "Deployed to:" | awk '{print $3}')
tx_hash=$(echo "$deploy_output" | grep "Transaction hash:" | awk '{print $3}')
echo "$contract_address" >"$DEPLOY_FILE"
echo -e "Contract Address: ${GREEN}$contract_address${NC}"
echo -e "Contract Link: ${GREEN}$EXPLORER_URL/address/$contract_address${NC}"

echo -e "\n"
print_success "Success. Treasure Hunt deployed on Seismic with your wallet!"

