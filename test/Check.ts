import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { WhiteChecker } from "../typechain-types";
import { MerkleTree } from "merkletreejs";
import {
  hashNode,
  readRawList,
  generateMerkleTree,
  generateStandardMerkleTree,
  verifyMerkleProof,
} from "../scripts/merkeltree";

import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("Check leaf hash in Merkle Tree: ", async () => {
  let root: string;
  let tree: StandardMerkleTree<any[]>;

  beforeEach(() => {
    [root, tree] = generateStandardMerkleTree();
  });

  const deployFunc = async () => {
    const White = await ethers.getContractFactory("WhiteChecker");
    const whiteChecker: WhiteChecker = await White.deploy();
    return whiteChecker;
  };

  it("should verify right: ", async () => {
    const whiteChecker = await loadFixture(deployFunc);
    await whiteChecker.setRoot(root);
    // console.log(tree.render());
    const proof = tree.getProof([
      "0x8ba1f109551bd432803012645ac136ddd64dba72",
      11,
    ]);

    expect(
      await whiteChecker.verify(
        "0x8ba1f109551bd432803012645ac136ddd64dba72",
        11,
        proof
      )
    ).to.be.true;
  });

  it("should verify wrong: ", async () => {
    const whiteChecker = await loadFixture(deployFunc);
    await whiteChecker.setRoot(root);
    // console.log(tree.render());
    const proof = tree.getProof([
      "0xC70A959c4aF43cd85727aC3ceB3a10B546a4cfb2",
      12,
    ]);

    await expect(
      whiteChecker.verify(
        "0xC70A959c4aF43cd85727aC3ceB3a10B546a4cfb2",
        14,
        proof
      )
    ).to.be.revertedWith("Not in tree");
  });
});
