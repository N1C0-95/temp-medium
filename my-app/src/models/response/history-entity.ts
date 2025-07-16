import { TableEntity } from "@azure/data-tables";

export interface HistoryEntity extends TableEntity {
    SourceLang: string;
    TargetLang: string;
    SourceText: string;
    timestamp?: string; // Optional field for the timestamp    
}