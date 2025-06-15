
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { placeBetInputSchema, cashOutInputSchema } from './schema';
import { getPlayerStats } from './handlers/get_player_stats';
import { placeBet } from './handlers/place_bet';
import { getGameStatus } from './handlers/get_game_status';
import { cashOut } from './handlers/cash_out';
import { getGameHistory } from './handlers/get_game_history';
import { generateCrashPoint } from './handlers/generate_crash_point';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  getPlayerStats: publicProcedure
    .query(() => getPlayerStats()),
    
  placeBet: publicProcedure
    .input(placeBetInputSchema)
    .mutation(({ input }) => placeBet(input)),
    
  getGameStatus: publicProcedure
    .query(() => getGameStatus()),
    
  cashOut: publicProcedure
    .input(cashOutInputSchema)
    .mutation(({ input }) => cashOut(input)),
    
  getGameHistory: publicProcedure
    .query(() => getGameHistory(10)),
    
  generateCrashPoint: publicProcedure
    .query(() => generateCrashPoint()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
