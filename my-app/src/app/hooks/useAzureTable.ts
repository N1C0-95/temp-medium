import { HistoryEntity } from "@/models/response/history-entity";
import { trpc } from "@/utils/trpcClient";
import { UseTRPCQueryOptions } from "@trpc/react-query/shared";



export function useAzureGetAllHistoryEnity() {
    return trpc.azureStorageRouter.getHistoryList.useQuery();
}
export function useAzureCreateHistoryEntity() {
    return trpc.azureStorageRouter.createHistory.useMutation();
}
export function useAzureUpdateHistoryEntity() {
    return trpc.azureStorageRouter.updateHistory.useMutation();
}
export function useAzureDeleteHistoryEntity() {
    return trpc.azureStorageRouter.deleteHistoryById.useMutation();
}
export function useAzureGetHistoryEntityById( partitionKey: string,  rowKey: string, options?: UseTRPCQueryOptions<HistoryEntity, HistoryEntity, any, any>) {
  return trpc.azureStorageRouter.getHistoryById.useQuery(    { partitionKey, rowKey } ,options );
}
export function useAzureGetHistoryEntityByUserId(userId: string,  continuationToken?: string, options?: UseTRPCQueryOptions<{ entities: HistoryEntity[]; continuationToken?: string }, { entities: HistoryEntity[]; continuationToken?: string }, any, any>) {
  return trpc.azureStorageRouter.getHistoryListByUserId.useQuery({ userId, continuationToken }, options);
}