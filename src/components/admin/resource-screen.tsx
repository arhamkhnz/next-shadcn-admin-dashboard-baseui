import { OperationsResource } from "./operations-resource";
import { PageHeader } from "./page-header";

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
      />
    </main>
  );
}
