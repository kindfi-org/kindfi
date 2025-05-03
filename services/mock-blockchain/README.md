# KindFi Mock Blockchain Services

Mock implementations of blockchain contracts for the KindFi platform. These mocks allow frontend and backend teams to develop against blockchain contracts before they're fully deployed.

## Features

- Implements full interfaces for NFT and Reputation contracts
- Simulates blockchain network delays and errors
- Configurable delay and error simulation options
- REST API for easy integration
- Docker container for local testing

## Getting Started

### Prerequisites

- Node.js 16+ or Bun runtime
- Docker (optional, for containerized usage)

### Installation

```bash
# Clone the repository
git clone git@github.com:ritik4ever/kindfi.git
cd kindfi/services/mock-blockchain

# Install dependencies
bun install
```

### Running Locally

```bash
# Start the mock blockchain server with Bun
bun dev

# Or build and run with Node
bun run build
node dist/index.js
```

### Using Docker

```bash
# Build the Docker image
docker build -t kindfi/mock-blockchain .

# Run the container
docker run -p 3800:3800 kindfi/mock-blockchain

# Or use docker-compose
docker-compose up
```

## Configuration

You can configure the mock services using environment variables:

- `PORT`: The port on which the server runs (default: 3800)
- `DELAY`: Simulated network delay in milliseconds (default: 500)
- `ERROR_RATE`: Probability of simulated errors (0-1, default: 0.1)

You can also update the configuration at runtime using the `/config` endpoint.

## API Reference

### Health Check

- `GET /health`: Check if the server is running

### Configuration

- `GET /config`: Get current configuration (delay and error rate)
- `PUT /config`: Update configuration
  ```json
  {
    "delay": 200,
    "errorRate": 0.05
  }
  ```

### NFT Contract API

- `POST /nft/mint`: Mint a new NFT
  ```json
  {
    "to": "0x123abc...",
    "metadataUrl": "https://example.com/metadata/1"
  }
  ```

- `GET /nft/token/:tokenId`: Get NFT details by token ID

- `POST /nft/transfer`: Transfer NFT to a new owner
  ```json
  {
    "from": "0x123abc...",
    "to": "0x456def...",
    "tokenId": "1"
  }
  ```

- `PUT /nft/metadata/:tokenId`: Update NFT metadata
  ```json
  {
    "metadataUrl": "https://example.com/metadata/updated"
  }
  ```

- `PUT /nft/upgrade/:tokenId`: Upgrade NFT tier
  ```json
  {
    "tier": "Silver" // Bronze, Silver, Gold, or Platinum
  }
  ```

- `GET /nft/owner/:address`: Get all NFTs owned by an address

### Reputation Contract API

- `GET /reputation/:address`: Get reputation data for an address

- `POST /reputation/award`: Award points to an address
  ```json
  {
    "address": "0x123abc...",
    "points": 50,
    "action": "Campaign Donation"
  }
  ```

- `POST /reputation/deduct`: Deduct points from an address
  ```json
  {
    "address": "0x123abc...",
    "points": 10,
    "reason": "Missed Milestone"
  }
  ```

- `GET /reputation/level/:points`: Calculate level based on points

- `GET /reputation/top/:limit`: Get the top N addresses by reputation

- `POST /reputation/reset/:address`: Reset reputation for an address

## Client Library

The package includes a client library that provides a simple and convenient way to interact with the mock blockchain services:

```typescript
import { MockBlockchainClient } from '@kindfi/mock-blockchain';

// Initialize the client
const client = new MockBlockchainClient('http://localhost:3800');

// Use the client to interact with the mock blockchain
async function example() {
  // Mint an NFT
  const tokenId = await client.nft.mint('0xUserAddress', 'https://example.com/metadata');
  
  // Award reputation points
  await client.reputation.awardPoints('0xUserAddress', 50, 'Created Campaign');
  
  // Get reputation
  const reputation = await client.reputation.getReputation('0xUserAddress');
  console.log(`User has ${reputation.points} points at level ${reputation.level}`);
}
```

The client library implements the same interfaces as the direct contract implementations but handles HTTP communication with the mock server.

## Integration Examples

### Direct Import in TypeScript

```typescript
import { MockNFTContract, MockReputationContract } from '@kindfi/mock-blockchain';

// Initialize mock contracts
const nftContract = new MockNFTContract({ delay: 200, errorRate: 0.05 });
const reputationContract = new MockReputationContract({ delay: 200, errorRate: 0.05 });

// Use the contracts
async function mintAndAwardPoints() {
  try {
    // Mint an NFT
    const tokenId = await nftContract.mint('0xUserAddress', 'https://example.com/metadata');
    console.log(`Minted NFT with token ID: ${tokenId}`);
    
    // Award points for minting
    await reputationContract.awardPoints('0xUserAddress', 50, 'NFT Minted');
    console.log('Points awarded for minting');
    
    // Get updated reputation
    const reputation = await reputationContract.getReputation('0xUserAddress');
    console.log(`User reputation: ${reputation.points} points, Level: ${reputation.level}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

mintAndAwardPoints();
```

### REST API Integration with Fetch API

```typescript
// Frontend example using fetch API
async function mintNFT(address: string, metadataUrl: string) {
  try {
    const response = await fetch('http://localhost:3800/nft/mint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: address,
        metadataUrl,
      }),
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to mint NFT');
    }
    
    return data.tokenId;
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}

// Example usage
mintNFT('0xUserAddress', 'https://example.com/metadata')
  .then(tokenId => {
    console.log(`Successfully minted NFT with token ID: ${tokenId}`);
    // Continue with other operations...
  })
  .catch(error => {
    console.error('Minting failed:', error);
  });
```

### React Component Example

```tsx
import React, { useState, useEffect } from 'react';

interface NFT {
  owner: string;
  metadataUrl: string;
  tier: string;
  lastUpdated: number;
}

const NFTViewer: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Example address
  const userAddress = '0xExampleUserAddress';
  
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        // Get all token IDs owned by the address
        const tokensResponse = await fetch(`http://localhost:3800/nft/owner/${userAddress}`);
        const tokensData = await tokensResponse.json();
        
        if (!tokensData.success) {
          throw new Error(tokensData.error || 'Failed to fetch tokens');
        }
        
        // Fetch details for each token
        const nftPromises = tokensData.tokens.map(async (tokenId: string) => {
          const response = await fetch(`http://localhost:3800/nft/token/${tokenId}`);
          const data = await response.json();
          return data.token;
        });
        
        const nftDetails = await Promise.all(nftPromises);
        setNfts(nftDetails);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTs();
  }, [userAddress]);
  
  if (loading) return <div>Loading NFTs...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Your NFTs</h2>
      {nfts.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft, index) => (
            <div key={index} className="nft-card">
              <h3>NFT #{index + 1}</h3>
              <p>Tier: {nft.tier}</p>
              <p>Last Updated: {new Date(nft.lastUpdated).toLocaleString()}</p>
              <a href={nft.metadataUrl} target="_blank" rel="noopener noreferrer">
                View Metadata
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTViewer;
```

## Using with Docker

The mock blockchain services can be run in a Docker container for local testing:

```bash
# Build and run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Testing with Mock Blockchain Services

The mock services are designed to be used in your tests. Here's an example of how to write tests using the mock contracts:

```typescript
import { describe, it, expect, beforeAll } from 'bun:test';
import { MockNFTContract, MockReputationContract } from '@kindfi/mock-blockchain';

describe('Campaign NFT Feature', () => {
  let nftContract: MockNFTContract;
  let reputationContract: MockReputationContract;
  
  beforeAll(() => {
    // Initialize contracts with no delay and no errors for faster tests
    nftContract = new MockNFTContract({ delay: 0, errorRate: 0 });
    reputationContract = new MockReputationContract({ delay: 0, errorRate: 0 });
  });
  
  it('should reward NFT for campaign donation', async () => {
    // Test your application logic using the mock contracts
    const tokenId = await nftContract.mint('0xDonor', 'https://example.com/metadata');
    expect(tokenId).toBeDefined();
    
    // Verify reputation was awarded
    await reputationContract.awardPoints('0xDonor', 50, 'Campaign Donation');
    const reputation = await reputationContract.getReputation('0xDonor');
    expect(reputation.points).toBe(50);
  });
});
```

You can find a more comprehensive test example in `examples/test-example.ts`.

## Running the Examples

The repository includes example code that demonstrates how to use the mock blockchain services:

```bash
# Run the usage example
bun examples/usage.ts

# Run the test example
bun test examples/test-example.ts
```

## Development

To contribute to the mock blockchain services:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `bun test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request