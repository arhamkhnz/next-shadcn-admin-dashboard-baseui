import { OperationsResource } from "./operations-resource";
import { PageHeader } from "./page-header";
import type { ResourceAction } from "./resource-types";

export function ResourceScreen({
  title,
  description,
  endpoint,
  columns,
  payloadKey,
  refreshInterval,
  emptyMessage,
  action,
  linkBase,
  linkIdKey,
  actions,
  actionIdKey,
  labelKeys,
  exportFilename,
}: {
  title: string;
  description: string;
  endpoint: string;
  columns: string[];
  payloadKey?: string;
  refreshInterval?: number;
  emptyMessage?: string;
  action?: React.ReactNode;
  linkBase?: string;
  linkIdKey?: string;
  actions?: ResourceAction[];
  actionIdKey?: string;
  labelKeys?: string[];
  exportFilename?: string;
}) {
  return (
    <main className="space-y-6">
      <PageHeader title={title} description={description} action={action} />
      <OperationsResource
        endpoint={endpoint}
        columns={columns}
        payloadKey={payloadKey}
        refreshInterval={refreshInterval}
        emptyMessage={emptyMessage}
        linkBase={linkBase}
        linkIdKey={linkIdKey}
        actions={actions}
        actionIdKey={actionIdKey}
        labelKeys={labelKeys}
        exportFilename={exportFilename ?? title}
      />
    </main>
  );
}
