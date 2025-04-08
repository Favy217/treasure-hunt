// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TreasureHunt {
    struct Treasure {
        bytes32 clueHash;
        address claimant;
        bool isClaimed;
        uint256 points;
        string hint;
    }

    address public deployer;
    Treasure[] public treasures;
    mapping(address => uint256) public points;
    mapping(address => uint256) public treasuresClaimed;
    address[] public players;

    constructor() {
        deployer = msg.sender;
    }

    function toLower(string memory _str) internal pure returns (string memory) {
        bytes memory bStr = bytes(_str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if (uint8(bStr[i]) >= 65 && uint8(bStr[i]) <= 90) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    function addTreasure(bytes32 _clueHash, uint256 _points, string memory _hint) external {
        require(msg.sender == deployer, "Only deployer can add treasures");
        require(_points > 0, "Points must be greater than zero");
        treasures.push(Treasure(_clueHash, address(0), false, _points, _hint));
    }

    function claimTreasure(uint256 _id, string memory _solution) external {
        Treasure storage t = treasures[_id];
        require(!t.isClaimed, "Treasure already claimed");
        string memory lowerSolution = toLower(_solution);
        require(keccak256(abi.encodePacked(lowerSolution)) == t.clueHash, "Wrong solution");
        t.isClaimed = true;
        t.claimant = msg.sender;
        if (points[msg.sender] == 0) {
            players.push(msg.sender);
        }
        points[msg.sender] += t.points;
        treasuresClaimed[msg.sender] += 1;
    }

    function updateHint(uint256 _id, string memory _newHint) external {
        require(msg.sender == deployer, "Only deployer can update hints");
        Treasure storage t = treasures[_id];
        t.hint = _newHint;
    }

    function treasureCount() external view returns (uint256) {
        return treasures.length;
    }

    function getTreasure(uint256 _id) external view returns (bytes32, address, bool, uint256, string memory) {
        Treasure memory t = treasures[_id];
        return (t.clueHash, t.claimant, t.isClaimed, t.points, t.hint);
    }

    function getPoints(address _player) external view returns (uint256) {
        return points[_player];
    }

    function getTreasuresClaimed(address _player) external view returns (uint256) {
        return treasuresClaimed[_player];
    }

    function getAllScores() external view returns (address[] memory, uint256[] memory, uint256[] memory) {
        uint256[] memory playerPoints = new uint256[](players.length);
        uint256[] memory playerTreasures = new uint256[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            playerPoints[i] = points[players[i]];
            playerTreasures[i] = treasuresClaimed[players[i]];
        }
        return (players, playerPoints, playerTreasures);
    }
}
