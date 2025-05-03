import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MockNFTContract } from './mockNFTContract';
import { MockReputationContract } from './mockReputationContract';

export class MockBlockchainServer {
  private app = express();
  private port: number;
  private nftContract: MockNFTContract;
  private reputationContract: MockReputationContract;

  constructor(port = 3800, config = { delay: 500, errorRate: 0.1 }) {
    this.port = port;
    this.nftContract = new MockNFTContract(config);
    this.reputationContract = new MockReputationContract(config);
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    
    // Error handling middleware
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
      });
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Configuration endpoint
    this.app.get('/config', (req, res) => {
      res.json({
        delay: this.nftContract.config.delay,
        errorRate: this.nftContract.config.errorRate
      });
    });

    this.app.put('/config', (req, res) => {
      const { delay, errorRate } = req.body;
      
      if (typeof delay === 'number') {
        this.nftContract.config.delay = delay;
        this.reputationContract.config.delay = delay;
      }
      
      if (typeof errorRate === 'number') {
        this.nftContract.config.errorRate = errorRate;
        this.reputationContract.config.errorRate = errorRate;
      }
      
      res.json({
        success: true,
        config: {
          delay: this.nftContract.config.delay,
          errorRate: this.nftContract.config.errorRate
        }
      });
    });

    // NFT Contract Routes
    this.app.post('/nft/mint', async (req, res, next) => {
      try {
        const { to, metadataUrl } = req.body;
        const tokenId = await this.nftContract.mint(to, metadataUrl);
        res.json({ success: true, tokenId });
      } catch (error) {
        next(error);
      }
    });

    this.app.get('/nft/token/:tokenId', async (req, res, next) => {
      try {
        const token = await this.nftContract.getToken(req.params.tokenId);
        if (!token) {
          return res.status(404).json({ success: false, error: 'Token not found' });
        }
        res.json({ success: true, token });
      } catch (error) {
        next(error);
      }
    });

    this.app.post('/nft/transfer', async (req, res, next) => {
      try {
        const { from, to, tokenId } = req.body;
        const success = await this.nftContract.transfer(from, to, tokenId);
        res.json({ success });
      } catch (error) {
        next(error);
      }
    });

    this.app.put('/nft/metadata/:tokenId', async (req, res, next) => {
      try {
        const { metadataUrl } = req.body;
        const success = await this.nftContract.updateMetadata(req.params.tokenId, metadataUrl);
        res.json({ success });
      } catch (error) {
        next(error);
      }
    });

    this.app.put('/nft/upgrade/:tokenId', async (req, res, next) => {
      try {
        const { tier } = req.body;
        const success = await this.nftContract.upgradeTier(req.params.tokenId, tier);
        res.json({ success });
      } catch (error) {
        next(error);
      }
    });

    this.app.get('/nft/owner/:address', async (req, res, next) => {
      try {
        const tokens = await this.nftContract.getOwnerTokens(req.params.address);
        res.json({ success: true, tokens });
      } catch (error) {
        next(error);
      }
    });

    // Reputation Contract Routes
    this.app.get('/reputation/:address', async (req, res, next) => {
      try {
        const reputation = await this.reputationContract.getReputation(req.params.address);
        res.json({ success: true, reputation });
      } catch (error) {
        next(error);
      }
    });

    this.app.post('/reputation/award', async (req, res, next) => {
      try {
        const { address, points, action } = req.body;
        const success = await this.reputationContract.awardPoints(address, points, action);
        res.json({ success });
      } catch (error) {
        next(error);
      }
    });

    this.app.post('/reputation/deduct', async (req, res, next) => {
      try {
        const { address, points, reason } = req.body;
        const success = await this.reputationContract.deductPoints(address, points, reason);
        res.json({ success });
      } catch (error) {
        next(error);
      }
    });

    this.app.get('/reputation/level/:points', async (req, res, next) => {
      try {
        const points = parseInt(req.params.points, 10);
        const level = await this.reputationContract.calculateLevel(points);
        res.json({ success: true, level });
      } catch (error) {
        next(error);
      }
    });

    this.app.get('/reputation/top/:limit', async (req, res, next) => {
      try {
        const limit = parseInt(req.params.limit, 10);
        const topAddresses = await this.reputationContract.getTopAddresses(limit);
        res.json({ success: true, topAddresses });
      } catch (error) {
        next(error);
      }
    });

    this.app.post('/reputation/reset/:address', async (req, res, next) => {
      try {
        const success = await this.reputationContract.resetReputation(req.params.address);
        res.json({ success });
      } catch (error) {
        next(error);
      }
    });
  }

  public start() {
    return this.app.listen(this.port, () => {
      console.log(`Mock Blockchain Server running on port ${this.port}`);
    });
  }
}