import { IDbConnectionFactory } from "@/data/IDbConnectionFactory";
import { IHistoryRepository } from "./IHistoryRepository";
import { HistoryEntity } from "@/models/response/history-entity";
import { TableEntityQueryOptions } from "@azure/data-tables";
import appConfig from "@/config/appConfig";

export class HistoryRepository implements IHistoryRepository {
  private readonly _dbConnectionFactory: IDbConnectionFactory;

  constructor(dbConnectionFactory: IDbConnectionFactory) {
    this._dbConnectionFactory = dbConnectionFactory;
  }

  // Method to get all history records
  async getAllHistory(): Promise<HistoryEntity[]> {
    const client = this._dbConnectionFactory.client;
    const entities: HistoryEntity[] = [];

    for await (const entity of client.listEntities<HistoryEntity>()) {
      entities.push(entity);
    }
    return entities;
  }

  // Method to get all history records by user ID
  async getAllHistoryByUserId(
    query: TableEntityQueryOptions,
    continuationToken?: string
  ): Promise<{ entities: HistoryEntity[]; continuationToken?: string }> {
    const client = this._dbConnectionFactory.client;

    const entities: HistoryEntity[] = [];

    const iter = client
      .listEntities<HistoryEntity>({ queryOptions: query  })
      .byPage({ maxPageSize: appConfig.paginationPageSize, continuationToken });

    const page = await iter.next();

    const nextToken = page.value.continuationToken;

    for await (const entity of page.value) {
      entities.push(entity);
    }

    return {
      entities,
      continuationToken: nextToken,
    };
  }

  // method to get a history record by ID
  getHistoryById(
    partitionKey: string,
    rowKey: string
  ): Promise<HistoryEntity | null> {
    const client = this._dbConnectionFactory.client;
    const result = client.getEntity<HistoryEntity>(partitionKey, rowKey);
    return result;
  }

  // method to create a new history record
  async addHistory(item: HistoryEntity): Promise<void> {
    const client = this._dbConnectionFactory.client;

    const entity = {
      ...item,
      partitionKey: item.partitionKey, // Assuming userId is used as PartitionKey
      rowKey: item.rowKey, // Assuming id is used as RowKey
    };
    await client.createEntity<HistoryEntity>(entity);
  }

  // method to update an existing history record
  async updateHistory(history: HistoryEntity): Promise<void> {
    const client = this._dbConnectionFactory.client;
    const entity = {
      ...history,
      partitionKey: history.partitionKey, // Assuming userId is used as PartitionKey
      rowKey: history.rowKey, // Assuming id is used as RowKey
    };
    await client.updateEntity<HistoryEntity>(entity, "Merge");
  }

  // method to delete a history record by ID
  async deleteHistoryById(partitionKey: string, rowKey: string): Promise<void> {
    const client = this._dbConnectionFactory.client;
    try {
      await client.deleteEntity(partitionKey, rowKey);
    } catch (error) {
      console.error("Error deleting history record:", error);
    }
  }
}
