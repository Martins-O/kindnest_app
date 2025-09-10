const { ethers } = require('ethers');

// Generate deterministic smart account address from email
function generateSmartAccountAddress(email) {
  // Create deterministic salt from email
  const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(email));
  
  // Simple deterministic address generation for demo
  // In production, this would use actual account factory
  const deterministicSeed = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['string', 'bytes32'], [email, salt])
  );
  
  // Generate address from seed
  const wallet = new ethers.Wallet(deterministicSeed);
  return wallet.address;
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  generateSmartAccountAddress,
  generateOTP
};