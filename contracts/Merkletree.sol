pragma solidity ^0.8.9;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";


contract Merkletree{
    bytes32 public rootHash;
    
    function setRootHash(bytes32 _rootHash) public{
        // 设置节点hash，需要做权限管理
        rootHash = _rootHash;
    }

    function claimable(bytes32[] memory proof, bytes32 leaf) public view returns(bool) {
        // 校验
        return MerkleProof.verify(proof, rootHash, leaf);
    }

    function claim(bytes32[] memory proof, bytes32 leaf) public {
        // 验证当前地址是否是msg.sender
        require(leaf == keccak256(abi.encodePacked(msg.sender)), "only by sender");

        // 验证叶子是否在白名单
        require(claimable(proof, leaf), 'auth faild');
        // mint Token and transfer to leaf address
    }
}
