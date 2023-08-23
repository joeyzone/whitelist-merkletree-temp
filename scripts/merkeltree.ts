import fs from "fs";
import { MerkleTree } from "merkletreejs";
import { ethers } from "hardhat";
import dotenv from "dotenv/config";
import path from "path";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

const keccak256 = ethers.keccak256;
const solidityPackedKeccak256 = ethers.solidityPackedKeccak256;

export const hashNode = (addr: string, amount: string | number): string => {
  return solidityPackedKeccak256(["address", "uint256"], [addr, amount]);
};

export const readRawList = (path: string): string => {
  const rawData = fs.readFileSync(path);
  const data = JSON.parse(rawData.toString());
  return data;
};

export const generateMerkleTree = (): [string, MerkleTree] => {
  const data = readRawList(path.join(__dirname, "./white.json"));
  const leaves = Object.entries(data).map((node: [string, string]) => {
    return hashNode(...node);
  });

  const tree = new MerkleTree(leaves, keccak256, { sort: false });
  const root = tree.getHexRoot();

  return [root, tree];
};

export const generateStandardMerkleTree = (): [string, any] => {
  const data = readRawList(path.join(__dirname, "./white.json"));
  const leaves = Object.entries(data);

  const tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);
  const root = tree.root;
  return [root, tree];
};

export const verifyMerkleProof = (
  pairs: [string, number | string],
  tree: MerkleTree,
  root: string
) => {
  const leaf = hashNode(...pairs);
  const proof = tree.getProof(leaf);
  if (!tree.verify(proof, leaf, root)) {
    console.error("Invalid proof");
    return false;
  }
  return true;
};

function main() {
  const vData = readRawList(path.join(__dirname, "./input.json"));
  const [root, tree] = generateMerkleTree();

  fs.writeFileSync(
    path.join(__dirname, "./output.json"),
    JSON.stringify({
      root: root,
      tree: tree,
    })
  );
  for (const [addr, amount] of Object.entries(vData)) {
    if (!verifyMerkleProof([addr, amount], tree, root)) {
      console.error(`${addr} not in whitelist`);
    } else {
      console.log(`${addr} in whitelist`);
    }
  }
}

// main();
