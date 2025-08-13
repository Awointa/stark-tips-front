StarkTips Frontend
A decentralized tipping dApp built on Starknet, allowing users to send on-chain tips using STRK tokens. Built with Next.js, TailwindCSS, Starknet React, and integrated with the CoinGecko API for real-time price conversion.

Tech Stack
Cairo – Smart contract language for Starknet.

Starknet React – Wallet and contract integration.

Starkli – Starknet CLI for deployment & interactions.

Next.js – Frontend framework.

TailwindCSS – Styling.

CoinGecko API – Token price conversion.

Vercel – Deployment.

Prerequisites
Before you begin, ensure you have:

Node.js (v18 or later)

npm or yarn installed

A Starknet-compatible wallet (e.g., Argent X or Braavos)

Access to the deployed smart contract address

Installation
Clone the repository:

bash
Copy
Edit
git clone https://github.com/Awointa/stark-tips-front
cd starktips
Install dependencies:
npm install


env
Copy
Edit
NEXT_PUBLIC_CONTRACT_ADDRESS= "0x030b8b082b4e8a8c289258798de1cfe3a293235cac2e1d8e5de28cdffcad4b79"
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
Note: Never commit .env.local to version control.

Running Locally
Start the development server:
npm run dev
Visit http://localhost:3000 in your browser.

Deployment
This project is optimized for deployment on Vercel.

Push your repo to GitHub.

Connect it to Vercel.

Add your environment variables in the Vercel dashboard.

Deploy.

Key Features
Wallet connection with Starknet React

Send tips using STRK tokens

Multicall batching for approve + send in a single transaction

Live USD price conversion via CoinGecko API

Responsive UI built with TailwindCSS

Development Notes
The frontend assumes the contract is already deployed.

Ensure the connected wallet has enough STRK on the selected network.

For local contract testing, use Starkli or the Starknet Devnet.

License
This project is open-source under the MIT License.