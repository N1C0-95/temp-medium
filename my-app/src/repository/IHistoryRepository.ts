import { HistoryEntity } from "@/models/response/history-entity";
import { TableEntityQueryOptions } from "@azure/data-tables";


export interface IHistoryRepository{
    getAllHistory(): Promise<HistoryEntity[]>;
    getAllHistoryByUserId( query: TableEntityQueryOptions,continuationToken?: string): Promise<{entities: HistoryEntity[];  continuationToken?: string}>;
    getHistoryById(qpartitionKey:string,  rowKey:string): Promise<HistoryEntity | null>;
    addHistory(history: HistoryEntity): Promise<void>;
    updateHistory(history: HistoryEntity): Promise<void>;
    deleteHistoryById(partitionKey:string,rowKey:string): Promise<void>;
}
    