#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "\n\n${BLUE}Step $1: $2${NC}"
}

print_success() {
    echo -e "✅ $1"
}
