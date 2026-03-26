export function generateCurlCommands(publicKey: string) {
  return {
    getAccountInfo: {
      curl: `
curl https://api.devnet.solana.com -s -X \
  POST -H "Content-Type: application/json" -d ' 
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getAccountInfo",
    "params": [
      "${publicKey}",
      {
        "commitment": "finalized",
        "encoding": "base64"
      }
    ]
  }
'
    `,
      description: "Returns the account state and metadata for a single address. Returns null if the account does not exist at the requested commitment."
    },
    getBalance: {
      curl: `
curl https://api.devnet.solana.com -s -X \
  POST -H "Content-Type: application/json" -d ' 
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getBalance",
    "params": [
      "${publicKey}",
      {
        "commitment": "finalized"
      }
    ]
  }
'
    `,
      description: "Returns the lamport balance for a single account address at the requested commitment."
    },
  }
}