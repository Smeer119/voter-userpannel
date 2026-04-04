import SHA256 from 'crypto-js/sha256.js';

export class Block {
  constructor(index, voterId, candidate, previousHash) {
    this.index = index;
    this.timestamp = Date.now();
    this.voterId = voterId;
    this.candidate = candidate;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.index + 
      this.previousHash + 
      this.timestamp + 
      JSON.stringify(this.voterId) + 
      JSON.stringify(this.candidate)
    ).toString();
  }
}

export const isChainValid = (chain) => {
  if (!chain || chain.length === 0) return true;

  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // Reconstruct the block locally to recalculate the hash
    const blockToVerify = new Block(
      currentBlock.index,
      currentBlock.voter_id,
      currentBlock.candidate,
      currentBlock.previous_hash
    );
    // Note: since block generation uses Date.now(), we must inject the timestamp from DB
    blockToVerify.timestamp = currentBlock.timestamp;
    const recalculatedHash = blockToVerify.calculateHash();

    // 1. Verify the hash matches what's stored
    if (currentBlock.hash !== recalculatedHash) {
      return false;
    }

    // 2. Verify the link to the previous block
    if (currentBlock.previous_hash !== previousBlock.hash) {
      return false;
    }
  }

  return true;
};
