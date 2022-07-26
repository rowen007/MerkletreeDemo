const hre = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const keccak256 = require("keccak256")

const WHITELIST = [
  "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  "0x8b8a11755a3f2B9f2cE384bc42Cb25053Eb4FF33",
  "0xd2Ece3F5A7738E4B14c13C0336E3e879755FCd77"
]
async function main() {

  const accounts = await hre.ethers.getSigners();
  WHITELIST.push(accounts[0].address)
  const CLAIM_ACCOUNT = accounts[0].address


  //初始化MerkleTree
  const leaves = WHITELIST.map(x => keccak256(x))
  const tree = new MerkleTree(leaves, keccak256)

  //Merkletree空投合约
  const MerkleTreeContract = await hre.ethers.getContractFactory("Merkletree");
  const merkleTree = await MerkleTreeContract.deploy();
  await merkleTree.deployed();


  const rootHash = tree.getRoot().toString('hex')
  // console.log('rootHash', `0x${rootHash}`)
  // 设置根节点hash
  await (await merkleTree.setRootHash('0x' + rootHash)).wait()

  console.log('rootHash', await merkleTree.rootHash())


  // ----------------------验证----------------------------------
  // 计算当前领取空投地址的hash值
  const leaf = keccak256(CLAIM_ACCOUNT)
  // 获取相邻节点hash
  const proof = tree.getProof(leaf)
  
  // 转为hex
  const leaf32 =  `0x${leaf.toString('hex')}`
  const proof32 = proof.map(x => '0x' + x.data.toString('hex'))

  // console.log(tree.verify(proof, leaf, rootHash))

  // 查询是否可以领取
  console.log('claimable', await merkleTree.claimable(proof32, leaf32))
  
  // 发送交易claim
  await (await merkleTree.claim(proof32, leaf32, {
    from: CLAIM_ACCOUNT
  })).wait()
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
