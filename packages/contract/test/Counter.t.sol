// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter(5);
    }

    function test_RevertBelowThreshold() public {
        counter.increment(suint256(3));
        vm.expectRevert();
        counter.getNumber();
    }

    function test_AboveThreshold() public {
        counter.increment(suint256(3));
        counter.increment(suint256(2));
        assertEq(counter.getNumber(), 5);
    }
}
