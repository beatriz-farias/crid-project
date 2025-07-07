const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // Pega a chave privada da variável ambiente (secrets do GitHub)
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not set in environment variables");
  }

  // Configura o provider da rede Sepolia
  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  // Cria a wallet do coordenador usando a chave privada e o provider
  const coordinator = new ethers.Wallet(privateKey, provider);

  // Defina o endereço do aluno - pode ser fixo, variável, ou outro segredo
  const studentAddress = "0x..."; // endereço do aluno (exemplo)

  const durationInSeconds = 60 * 60 * 24 * 7; // 7 dias

  console.log("Deploying CRID contract...");
  console.log(`Coordinator: ${coordinator.address}`);
  console.log(`Student: ${studentAddress}`);
  console.log(`Duration: ${durationInSeconds} seconds`);

  const CRID = await ethers.getContractFactory("CRID", coordinator);

  const crid = await CRID.deploy(studentAddress, durationInSeconds);

  await crid.waitForDeployment();

  console.log(
    `\n✅ CRID contract successfully deployed for student ${studentAddress}.`
  );
  console.log(`   Contract address: ${crid.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
