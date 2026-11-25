import type { ResultName } from './results';

export type OperationLog = {
  operation: string;
  result: ResultName;
  accountId?: string;
};

export function formatOperationLog(entry: OperationLog): string {
  const account = entry.accountId === undefined ? '' : ` account=${entry.accountId}`;
  return `${entry.operation} result=${entry.result}${account}`;
}

export function formatSendFailedLog(): string {
  return 'send failed';
}
