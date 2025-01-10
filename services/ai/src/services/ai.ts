import { HfInference } from "@huggingface/inference";
import "dotenv/config";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function analyzeSentiment(text: Buffer) {
  const result = await hf.imageSegmentation({
    model: "distilroberta-base",
    data: text,
  });
  return result;
}

export async function verifyBiometrics(image: Buffer) {
  const result = await hf.imageClassification({
    model: "ViT-B/32",
    data: image,
  });
  return result;
}
