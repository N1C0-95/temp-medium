import { TableClient } from "@azure/data-tables";

export interface IDbConnectionFactory {
    client: TableClient
}