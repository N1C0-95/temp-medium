import { router, publicProcedure } from "./trpc";
import { gptRouter } from "./routers/gptRouter";
import { translatorRouter } from "./routers/translatorRouter";
import { azureStorageRouter } from "./routers/azureStorageRouter";


export const appRouter = router({
  gptRouter,
  translatorRouter,
  azureStorageRouter,
  
})

export type AppRouter = typeof appRouter;