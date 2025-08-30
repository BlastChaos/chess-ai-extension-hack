import { publicProcedure, router } from "./trpc.js";
import { z } from "zod";
import { Pieces, Colors } from "../types.js";
import { getBestMove } from "../service/getBestMove.js";

// Export both the router instance and type
export const appRouter = router({
  getBestMove: publicProcedure
    .input(
      z.object({
        pieces: z.array(
          z.object({
            piece: z.nativeEnum(Pieces),
            color: z.nativeEnum(Colors),
            position: z.object({
              x: z.number(),
              y: z.number(),
            }),
          })
        ),
        history: z.array(
          z.object({
            from: z.object({
              x: z.number(),
              y: z.number(),
            }),
            to: z.object({
              x: z.number(),
              y: z.number(),
            }),
            piece: z.nativeEnum(Pieces),
            color: z.nativeEnum(Colors),
            turn: z.number(),
            promotion: z.nativeEnum(Pieces).optional(),
          })
        ),
        userColor: z.nativeEnum(Colors),
        currentTurn: z.nativeEnum(Colors),
        isUserTurn: z.boolean(),
      })
    )
    .output(
      z.object({
        initialPosition: z.object({
          x: z.number(),
          y: z.number(),
        }),
        finalPosition: z.object({
          x: z.number(),
          y: z.number(),
        }),
        promotion: z.nativeEnum(Pieces).nullable(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const bestMove = await getBestMove(input);
      return bestMove;
    }),
});

export type AppRouter = typeof appRouter;
