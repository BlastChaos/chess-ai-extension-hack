import { publicProcedure, router } from "./trpc.js";
import { z } from "zod";

// Export both the router instance and type
export const appRouter = router({

});

export type AppRouter = typeof appRouter;
