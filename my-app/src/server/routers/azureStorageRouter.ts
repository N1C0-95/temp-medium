import z from "zod";
import { publicProcedure, router } from "../trpc";
import { useHistoryService } from "@/repository/useHistoryService";
import { HistoryEntity } from "@/models/response/history-entity";
import { TRPCError } from "@trpc/server";


export const historyEntitySchema = z.object({
  partitionKey: z.string(),
  rowKey: z.string(),
  SourceLang: z.string(),
  TargetLang: z.string(),
  SourceText: z.string()  
})

export const azureStorageRouter = router({
  getHistoryList: publicProcedure
      .query(() => useHistoryService().actions.historyList()),
  getHistoryListByUserId: publicProcedure
      .input(z.object({ userId: z.string(), continuationToken: z.string().optional() }))
      .query(({ input }) => useHistoryService().actions.historyListByUserId(input.userId, input.continuationToken)),
  getHistoryById: publicProcedure
      .input(z.object({ partitionKey: z.string(), rowKey: z.string() }))
      .query(async ({ input }) => {
        
          return await useHistoryService().actions.getHistoryEntityById(input.partitionKey, input.rowKey);
      }),
  createHistory: publicProcedure
      .input(z.object({data : historyEntitySchema})).mutation(async ({ input }) => {
        try{

          return useHistoryService().actions.createHistoryEntity(input.data as HistoryEntity);
        } catch (error : any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Failed to create history entity',
          });
        }
      }),
  updateHistory: publicProcedure
      .input(z.object({data : historyEntitySchema})).mutation(async ({ input }) => {
        return useHistoryService().actions.updateHistoryEntity(input.data as HistoryEntity);
      }),
  deleteHistoryById: publicProcedure
      .input(z.object({ partitionKey: z.string(), rowKey: z.string() }))
      .mutation(async ({ input }) => {
        return useHistoryService().actions.deleteHistoryEntityById(input.partitionKey, input.rowKey);
      })
});