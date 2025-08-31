import OpenAI from "openai";

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\n", " ");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { data } = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });

  return data[0]?.embedding || [];
};
