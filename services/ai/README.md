# Service to call a model to predict the sentiment of a text, biometrics, etc

> The model is trained with a dataset of labeled data and can predict the sentiment of a text, biometrics, etc. for a given input (image, video).

## AI Integration, An Useful Guide

### Overview

This guide provides instructions on how to integrate AI models within the KYC service using HuggingFace. The AI models will be used for various tasks such as sentiment analysis, biometric verification, and more. The integration will be handled within an Express TypeScript server.

### Steps to Integrate AI Models

1. **Set Up HuggingFace API**:

- Sign up for a HuggingFace account and obtain an API key.
- Install the HuggingFace SDK using bun:

  ```sh
  bun add @huggingface/inference
  ```

2. **Configure Environment Variables**:

- Add your HuggingFace API key to the `.env` file:

  ```
  HUGGINGFACE_API_KEY=your_api_key_here
  ```

3. **Create AI Service**:

- Create a new service file `src/services/ai.ts` to handle AI model interactions:

  ```ts
  import { HfInference } from "@huggingface/inference";
  import "dotenv/config";

  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

  export async function analyzeSentiment(text: string) {
    const result = await hf.sentimentAnalysis({ inputs: text });
    return result;
  }

  export async function verifyBiometrics(image: Buffer) {
    const result = await hf.imageClassification({ inputs: image });
    return result;
  }
  ```

4. **Handle AI Model Results**:

- Ensure that the results from the AI models are properly handled and stored in the database.

### Folder Structure

The following folder structure is recommended for the AI service to keep files modular and organized in kebab-case:

```bash
/home/andler/Development/monorepo/kindfi/services/ai/
├── src/
│   ├── services/ # AI service to interact with HuggingFace models
│   │   └── ai.ts
│   ├── constants/ # Constants for AI models and KYC application
│   │   ├── models/ # AI model weights and configurations for HuggingFace and other models
│   │   │   ├── age-gender-weight.manifest.json
│   │   │   ├── age-gender-weight.model.bin
│   │   │   ├── face-expression-weight.manifest.json
│   │   │   └── face-expression-weight.model.bin
│   │   └── config/ # AI model configuration
│   │       └── index.ts
│   ├── utils/ # Utility functions
│   │   └── index.ts
│   ├── middlewares/ # Express middlewares
│   │   └── error-handler.ts
│   └── app.ts
├── tests/ # Test files for controllers and services
│   ├── services/
│   │   └── ai.test.ts
│   └── setup.ts
├── .env
├── bun.lockb
├── package.json
└── README.md
```
