// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
  suint256 private number;
  uint256 public threshold;

  constructor(uint256 _threshold) {
    number = suint256(0);
    threshold = _threshold;
  }

  function increment(suint256 amount) public {
    number += amount;
  }

  function getNumber() public view isThresholdReached returns (uint256) {
    return uint256(number);
  }

  modifier isThresholdReached() {
    require(number >= suint256(threshold), 'Threshold not reached');
    _;
  }
}
