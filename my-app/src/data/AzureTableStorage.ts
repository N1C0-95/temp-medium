import {
  TableClient,
  AzureNamedKeyCredential
} from "@azure/data-tables";
import { IDbConnectionFactory } from "./IDbConnectionFactory";

export class AzureTableStorage implements IDbConnectionFactory {
  public client: TableClient;

  constructor() {
    
    const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
    const tableName = process.env.AZURE_TABLE_NAME!;

    const credential = new AzureNamedKeyCredential(account, accountKey);

    this.client = new TableClient(
      `https://${account}.table.core.windows.net`,
      tableName,
      credential
    );
  }
}
