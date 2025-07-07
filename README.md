# CRID: Gas-Efficient Course Enrollment Smart Contract

Este projeto implementa um sistema de Comprovante de Registro de Inscrição em Disciplinas (CRID) na blockchain Ethereum. Ele utiliza um padrão inspirado em State Channels (Canais de Estado), semelhante a canais de pagamento, para permitir que o processo de inscrição em disciplinas seja realizado de forma segura, rápida e com uma economia significativa de custos de transação (gás).

A maior parte da negociação entre o coordenador do curso e o aluno ocorre fora da blockchain (off-chain), e apenas a inscrição final é registrada na blockchain (on-chain), exigindo uma única transação principal.

## Como Funciona

O fluxo do processo é projetado para minimizar as interações com a blockchain, que são custosas.

### Abertura do Canal (Início do Período de Inscrição):

- O Coordenador do Curso implanta o smart contract `CRID.sol` na blockchain.
- No momento da implantação, ele especifica o endereço do Aluno e um prazo final (deadline) para que a inscrição seja efetivada.

### Negociação Off-Chain (Assinatura de Autorizações):

- O aluno e o coordenador discutem e definem a lista de disciplinas fora da blockchain (via e-mail, portal acadêmico, etc.).
- Quando a lista é definida, o Coordenador gera um hash da lista de disciplinas e do endereço do contrato. Em seguida, ele assina criptograficamente esse hash com sua chave privada.
- Esta assinatura funciona como uma autorização inviolável. O processo pode ser repetido várias vezes para diferentes listas de disciplinas, sem nenhum custo de gás.

### Fechamento do Canal (Efetivação da Inscrição):

- O Aluno, de posse da última lista de disciplinas e da assinatura correspondente do coordenador, chama a função `enroll()` no smart contract.
- O contrato verifica se a assinatura é válida e se corresponde à chave privada do coordenador.
- Se tudo estiver correto, o contrato armazena permanentemente a lista de disciplinas na blockchain, finalizando a inscrição. Esta é a única transação que o aluno precisa pagar.

### Proteção por Timeout:

- Se o aluno não efetivar a inscrição até o prazo final, o Coordenador pode invocar a função `cancelByTimeout()`. Isso "congela" o contrato, garantindo que o processo não fique em um estado indefinido.

## ✨ Features

- **Eficiência de Gás:** Reduz drasticamente os custos ao exigir apenas uma transação on-chain para finalizar a inscrição, independentemente de quantas alterações foram feitas na lista de disciplinas.
- **Segurança Criptográfica:** Utiliza assinaturas digitais (ECDSA) para garantir que apenas o coordenador autorizado possa aprovar uma lista de disciplinas.
- **Não-Repúdio:** O registro final na blockchain serve como uma prova definitiva e imutável da inscrição do aluno.
- **Proteção contra Falhas:** Um mecanismo de timeout garante que o processo possa ser cancelado caso o aluno não o finalize, liberando o estado do contrato.
- **Testes Abrangentes:** Cobertura de testes completa com Hardhat para garantir a robustez e o comportamento esperado do contrato.
- **CI/CD Integrado:** Um pipeline de Integração Contínua com GitHub Actions que compila e testa o contrato a cada push ou pull request, garantindo a qualidade do código.

## 🛠️ Stack Tecnológico

- **Solidity:** Linguagem para a escrita do smart contract.
- **Hardhat:** Ambiente de desenvolvimento, compilação, teste e deploy de smart contracts.
- **Ethers.js:** Biblioteca para interagir com a blockchain Ethereum nos testes e scripts.
- **Chai & Mocha:** Frameworks de teste para validar o comportamento do contrato.
- **GitHub Actions:** Automação do pipeline de CI/CD.

## 📁 Estrutura do Projeto

```
.
├── contracts/
│   └── CRID.sol          # O código-fonte do smart contract.
├── scripts/
│   └── deploy-crid.js    # (Opcional) Script para facilitar o deploy.
├── test/
│   └── crid.test.js      # Testes automatizados para o contrato.
├── .github/
│   └── workflows/
│       └── ci.yml        # Definição do pipeline de CI com GitHub Actions.
├── hardhat.config.js     # Arquivo de configuração do Hardhat.
└── package.json          # Dependências e scripts do projeto.
```

## 🚀 Começando

### Pré-requisitos

- Node.js (versão 18.x ou superior)
- npm ou yarn

### Instalação e Configuração

Clone o repositório:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_SEU_PROJETO>
```

Instale as dependências:

```bash
npm install
```

## ⚙️ Uso

### Compilar o Contrato

Para compilar o smart contract e gerar os artefatos (ABI e bytecode), execute:

```bash
npx hardhat compile
```

### Rodar os Testes

Para executar o conjunto completo de testes e garantir que tudo está funcionando como esperado:

```bash
npx hardhat test
```

### Fazer o Deploy

Para fazer o deploy do contrato em uma rede local (localhost), você precisa de dois terminais.

**1. No primeiro terminal, inicie o nó local do Hardhat:**
```bash
npx hardhat node
```

Este comando inicia uma blockchain local e gera várias contas de teste. Mantenha este terminal rodando.

**2. No segundo terminal, execute o script de deploy:**

```bash
npx hardhat run scripts/deploy-crid.js --network localhost
```
Este script irá se conectar ao nó local que você iniciou e implantar o contrato.

## ⚖️ Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
