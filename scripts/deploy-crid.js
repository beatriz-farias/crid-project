const hre = require("hardhat");

async function main() {
  // Você precisará definir o endereço do aluno e a duração aqui.
  // Por exemplo, usando o segundo endereço da sua lista de signers do Hardhat.
  const signers = await hre.ethers.getSigners();
  const studentAddress = signers[1].address; // Endereço do aluno
  const durationInSeconds = 60 * 60 * 24 * 7; // 7 dias

  const CRID = await hre.ethers.getContractFactory("CRID");
  const crid = await CRID.deploy(studentAddress, durationInSeconds);

  await crid.deployed();

  console.log(
    `CRID contract deployed for student ${studentAddress} with a deadline of ${durationInSeconds} seconds.`
  );
  console.log(`Contract address: ${crid.address}`);
  console.log(`Deployed by coordinator: ${signers[0].address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});