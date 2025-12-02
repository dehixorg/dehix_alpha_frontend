// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/SBT.sol";
import "../src/Record.sol";
import "../src/Escrow.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        DehixSBT sbt = new DehixSBT();
        DehixRecordID record = new DehixRecordID();
        DehixEscrow escrow = new DehixEscrow();

        console2.log("DehixSBT deployed at", address(sbt));
        console2.log("DehixRecordID deployed at", address(record));
        console2.log("DehixEscrow deployed at", address(escrow));

        vm.stopBroadcast();
    }
}
