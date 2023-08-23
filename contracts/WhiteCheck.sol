// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract WhiteChecker {
    address public owner;
    bytes32 private _root;

    constructor() {
        owner = msg.sender;
    }

    function verify(
        address addr,
        uint256 amount,
        bytes32[] calldata proof
    ) public view returns (bool) {
        // bytes32 leaf = keccak256(abi.encodePacked(addr, amount));
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(addr, amount)))
        );
        require(MerkleProof.verify(proof, _root, leaf), "Not in tree");
        return true;
    }

    function setRoot(bytes32 s_root) public {
        require(owner == msg.sender);
        _root = s_root;
    }
}
