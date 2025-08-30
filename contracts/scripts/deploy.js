const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying KindNest to LISK Network...");
  console.log("Network:", await hre.ethers.provider.getNetwork());
  
  const [deployer] = await hre.ethers.getSigners();
  
  if (!deployer) {
    console.error("❌ No deployer account found. Please configure your PRIVATE_KEY in .env");
    console.log("📋 Steps to deploy:");
    console.log("1. Get testnet ETH from LISK bridge: https://bridge.lisk.com");
    console.log("2. Set PRIVATE_KEY in contracts/.env with your wallet's private key");
    console.log("3. Run deployment again");
    process.exit(1);
  }
  
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy CareCircleFactory (rebranded from ExpenseFactory)
  const CareCircleFactory = await hre.ethers.getContractFactory("ExpenseFactory");
  console.log("Deploying CareCircleFactory...");
  
  const factory = await CareCircleFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("✅ CareCircleFactory deployed to:", factoryAddress);
  
  const explorerUrl = hre.network.name === "liskSepolia" 
    ? `https://sepolia-blockscout.lisk.com/address/${factoryAddress}`
    : `https://blockscout.lisk.com/address/${factoryAddress}`;
  console.log("🔍 Verify on LISK Explorer:", explorerUrl);
  
  // Deploy a sample care circle for demo
  console.log("Creating sample care circle...");
  const tx = await factory.createGroup("Maria's Recovery Fund", "Maria");
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => {
    try {
      const parsedLog = factory.interface.parseLog(log);
      return parsedLog.name === 'GroupCreated';
    } catch {
      return false;
    }
  });
  
  let sampleGroupAddress = "0x0000000000000000000000000000000000000000";
  if (event) {
    const parsedLog = factory.interface.parseLog(event);
    sampleGroupAddress = parsedLog.args.group;
    console.log("✅ Sample care circle deployed to:", sampleGroupAddress);
  } else {
    console.log("⚠️ Could not find GroupCreated event");
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: await hre.ethers.provider.getNetwork(),
    careCircleFactory: factoryAddress,
    sampleGroup: sampleGroupAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorerUrls: {
      factory: explorerUrl,
      sampleGroup: hre.network.name === "liskSepolia" 
        ? `https://sepolia-blockscout.lisk.com/address/${sampleGroupAddress}`
        : `https://blockscout.lisk.com/address/${sampleGroupAddress}`
    }
  };
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'lisk-deployment.json'), 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 Deployment info saved to deployment-lisk.json");
  
  // Contract verification
  console.log("⏳ Waiting for contract verification...");
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
  
  try {
    await hre.run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified on LISK Blockscout");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message);
    console.log("Manual verification URL:", explorerUrl);
  }
  
  console.log("\n🎉 Deployment Summary:");
  console.log("CareCircleFactory:", factoryAddress);
  console.log("Sample Group:", sampleGroupAddress);
  console.log("Network:", hre.network.name);
  console.log("Explorer:", explorerUrl);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });