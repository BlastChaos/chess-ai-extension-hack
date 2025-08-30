import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  fastifyTRPCPlugin,
  FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { createContext, AppRouter, appRouter } from "@chess-ai/ai";
export const config = {
  port: Number(process.env.PORT) || 3001,
};

dotenv.config();

// Create Fastify instance with logging
const fastify = Fastify();

// Start server
async function start() {
  try {
    fastify.register(cors, {
      origin: "*",
      allowedHeaders: ["Content-Type", "Authorization"],
    });
    fastify.register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      trpcOptions: {
        router: appRouter,
        createContext,
        onError({ path, error }) {
          // report to error monitoring
          console.error(`Error in tRPC handler on path '${path}':`, error);
        },
      } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
    });
    console.log("Registering trpc plugin");
    await fastify.listen({
      port: config.port,
      host: "0.0.0.0",
    });
    console.log(`Server listening on http://localhost:${config.port}`);
  } catch (err) {
    console.log("Error", err);
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  fastify.log.info("Received SIGINT, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  fastify.log.info("Received SIGTERM, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

// Start the server
start();
