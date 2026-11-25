import type { JSX } from 'react';
import traceability from '../../../../../docs/traceability/ui-traceability.json' with { type: 'json' };

type TraceRecord = {
  id: string;
  name: string;
  flows: string[];
  businessRules: string[];
  acceptanceCriteria: string[];
  design?: Record<string, string>;
  components?: string[];
  renderer?: string[];
  uiModel?: string[];
  ipc?: string[];
  main?: string[];
  application?: string[];
  domain?: string[];
  persistence?: string[];
  tests?: string[];
};

function TraceList({ title, values }: { title: string; values?: string[] | undefined }): JSX.Element | null {
  if (values === undefined || values.length === 0) return null;
  return (
    <section className="qa-trace-group">
      <h3>{title}</h3>
      <ul>
        {values.map((value) => <li key={value}><code>{value}</code></li>)}
      </ul>
    </section>
  );
}

export function TraceabilityInspector({
  screen,
  open,
  onClose,
}: {
  screen: string;
  open: boolean;
  onClose: () => void;
}): JSX.Element | null {
  if (!open) return null;
  const record = traceability.screens.find((item) => item.id === screen) as unknown as TraceRecord | undefined;
  if (record === undefined) return null;
  const design = record.design as Record<string, string> | undefined;
  return (
    <aside className="qa-inspector" aria-label="UI traceability inspector">
      <div className="qa-inspector-header">
        <div>
          <p className="qa-eyebrow">DEVELOPMENT / QA</p>
          <h2>Traceability</h2>
        </div>
        <button className="quiet" type="button" onClick={onClose} aria-label="Close traceability inspector">
          Close
        </button>
      </div>
      <div className="qa-inspector-content">
        <div className="qa-screen-identity">
          <strong>{record.id}</strong>
          <span>{record.name}</span>
        </div>
        <TraceList title="Product requirements" values={record.acceptanceCriteria} />
        <TraceList title="Business rules" values={record.businessRules} />
        <TraceList title="User flows" values={record.flows} />
        <TraceList title="Design specifications" values={Object.values(design ?? {})} />
        <TraceList title="Components" values={record.components} />
        <TraceList title="Renderer / UI model" values={[...(record.renderer ?? []), ...(record.uiModel ?? [])]} />
        <TraceList title="IPC / Main process" values={[...(record.ipc ?? []), ...(record.main ?? [])]} />
        <TraceList title="Application / Domain / Persistence" values={[
          ...(record.application ?? []),
          ...(record.domain ?? []),
          ...(record.persistence ?? []),
        ]} />
        <TraceList title="Automated tests" values={record.tests} />
        <p className="qa-evidence-note">
          Runtime screenshot: {traceability.evidencePolicy.runtimeScreenshots} · Manual acceptance: {traceability.evidencePolicy.manualAcceptance}
        </p>
        <p className="qa-footnote">
          This panel displays registry mappings. Empty test mappings are not evidence of passing tests.
        </p>
      </div>
    </aside>
  );
}
