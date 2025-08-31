import { pipeline } from "@xenova/transformers";

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const input = value.replaceAll("\n", " ");

  const embedding = await embedder(input);

  return embedding.data as number[];
};
