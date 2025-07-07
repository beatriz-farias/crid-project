const hre = require("hardhat");

async function main() {
  // Você precisará definir o endereço do aluno e a duração aqui.
  // Por exemplo, usando o segundo endereço da sua lista de signers do Hardhat.
  const signers = await hre.ethers.getSigners();
  
  if (signers.length < 2) {
    console.error("Not enough accounts. Need at least 2 for coordinator and student.");
    return;
  }

  const coordinator = signers[0];
  const student = signers[1];
  
  const studentAddress = student.address;
  const durationInSeconds = 60 * 60 * 24 * 7; // 7 dias

  console.log("Deploying CRID contract...");
  console.log(Coordinator: ${coordinator.address});
  console.log(Student: ${studentAddress});
  console.log(Duration: ${durationInSeconds} seconds);

  const CRID = await hre.ethers.getContractFactory("CRID");
  
  // O deploy é feito pela conta do coordenador
  const crid = await CRID.connect(coordinator).deploy(studentAddress, durationInSeconds);

  // A função .deployed() foi removida. O 'await' na linha acima já espera a conclusão.
  // Para ter certeza que a transação foi minerada e obter o endereço, usamos:
  await crid.waitForDeployment();
  const contractAddress = await crid.getAddress();

  console.log(
    \n✅ CRID contract successfully deployed for student ${studentAddress}.
  );
  console.log(   Contract address: ${contractAddress});
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
