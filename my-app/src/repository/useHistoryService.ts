import { AzureTableStorage } from "@/data/AzureTableStorage";
import { HistoryRepository } from "./HistoryRepository";
import { HistoryEntity } from "@/models/response/history-entity";
import { TableEntityQueryOptions } from "@azure/data-tables";
import { HistoryServiceError } from "@/models/types/HistoryServiceError";

// Define span names for telemetry tracking
enum HistorySpanName {  
  HistoryEntityCreated = "HistoryEntityCreated",
  HistoryEntityCreateFailed = "HistoryEntityCreateFailed"
}

import{trackCustomEvent} from "@/utils/appInsightsClient";
export function useHistoryService() {
  const repo = new HistoryRepository(new AzureTableStorage());

  const tracerName = "HistoryService";

  async function historyList() {    
    return repo.getAllHistory();
  }
  async function historyListByUserId(userId: string, continuationToken?: string) {
    
    if (!userId) 
        throw new Error("User ID is required to filter history records.");
    const filter: string = `PartitionKey eq '${userId}'`;

    const queryOptions: TableEntityQueryOptions = {
        filter: filter
    };
    return repo.getAllHistoryByUserId(queryOptions, continuationToken)
  }

  async function createHistoryEntity(history: HistoryEntity) {
    try{
      await repo.addHistory(history);
      trackCustomEvent(
        tracerName,
        HistorySpanName.HistoryEntityCreated,
        {
          partitionKey: history.partitionKey,
          rowKey: history.rowKey
        }
      );
    } catch (err) {
      trackCustomEvent(
        tracerName,
        HistorySpanName.HistoryEntityCreateFailed,
        {
          body: JSON.stringify(history),
          error: err instanceof Error ? err.message : "Unknown error"
        }
      );
      const error : HistoryServiceError = {
        type: "DbError",
        message: "Failed to create history entity",
        details: err instanceof Error ? err.message : "Unknown error"
      }
      throw error;
    }
  } 

  async function getHistoryEntityById(partitionKey: string, rowKey: string) {
    if (!partitionKey || !rowKey)
      throw new Error("PartitionKey and RowKey are required to retrieve a history record.");
    return repo.getHistoryById(partitionKey, rowKey);

  }

  async function updateHistoryEntity(history: HistoryEntity) {
    if (!history.partitionKey || !history.rowKey)
      throw new Error("PartitionKey and RowKey are required to update a history record.");
    return repo.updateHistory(history);
  }
  async function deleteHistoryEntityById(partitionKey: string, rowKey: string) {
    if (!partitionKey || !rowKey)
      throw new Error("PartitionKey and RowKey are required to delete a history record.");
    return repo.deleteHistoryById(partitionKey, rowKey);
  }
  
  return{
    actions:{
        historyList,
        historyListByUserId,
        getHistoryEntityById,
        updateHistoryEntity,
        createHistoryEntity,
        deleteHistoryEntityById
    }
  }
}
