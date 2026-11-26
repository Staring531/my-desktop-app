'use client';

import { useState } from 'react';
import { browserTimeZone, sendJson, type ApiBody } from '../lib/api';
import { CommandButton, Page, Result, TextField, UnsignedLinks } from './ui';

export function RegisterForm({ timeZone = browserTimeZone() }: { timeZone?: string }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);

  async function submit() {
    if (phase === 'waiting') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson('/api/registrations', 'POST', {
      username,
      email,
      password,
      nickname,
      timezone: timeZone,
    });
    setBody(next);
    setPhase('done');
  }

  return (
    <Page title="Register" links={<UnsignedLinks />}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <TextField label="Username" value={username} onChange={setUsername} />
        <TextField label="Email" value={email} onChange={setEmail} />
        <TextField label="Password" value={password} onChange={setPassword} type="password" />
        <TextField label="Nickname" value={nickname} onChange={setNickname} />
        <CommandButton variant="primary" type="submit">
          Register
        </CommandButton>
      </form>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}

export function VerifyForm({ onOk }: { onOk: (path: string) => void }) {
  return (
    <ProofForm
      title="Verify"
      fields={['Proof']}
      command="Verify"
      path="/api/registrations/verify"
      onOk={() => onOk('/login')}
      build={(values) => ({ code: values.Proof ?? '' })}
    />
  );
}

export function CancelRegistrationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);

  async function submit() {
    if (phase === 'waiting') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson('/api/registrations/cancel', 'POST', { email, password });
    setBody(next);
    setPhase('done');
  }

  return (
    <Page title="Cancel registration" links={<UnsignedLinks />}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <TextField label="Email" value={email} onChange={setEmail} />
        <TextField label="Password" value={password} onChange={setPassword} type="password" />
        <CommandButton variant="primary" type="submit">
          Cancel registration
        </CommandButton>
      </form>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}

export function LoginForm({ initial, onOk }: { initial?: ApiBody; onOk: (path: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>(
    initial === undefined ? 'idle' : 'done',
  );
  const [body, setBody] = useState<ApiBody | undefined>(initial);

  async function submit() {
    if (phase === 'waiting') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson('/api/sessions', 'POST', { email, password });
    setBody(next);
    setPhase('done');
    if (next.result === 'ok') {
      onOk('/calendar');
    }
  }

  return (
    <Page title="Log in" links={<UnsignedLinks />}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <TextField label="Email" value={email} onChange={setEmail} />
        <TextField label="Password" value={password} onChange={setPassword} type="password" />
        <CommandButton variant="primary" type="submit">
          Log in
        </CommandButton>
      </form>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}

export function StartRecoveryForm() {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);

  async function submit() {
    if (phase === 'waiting') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson('/api/recoveries', 'POST', { email });
    setBody(next);
    setPhase('done');
  }

  return (
    <Page title="Start recovery" links={<UnsignedLinks />}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <TextField label="Email" value={email} onChange={setEmail} />
        <CommandButton variant="primary" type="submit">
          Start recovery
        </CommandButton>
      </form>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}

export function CompleteRecoveryForm({ onOk }: { onOk: (path: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [proof, setProof] = useState('');
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);

  async function submit() {
    if (phase === 'waiting') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson('/api/recoveries/complete', 'POST', {
      email,
      password,
      proof,
    });
    setBody(next);
    setPhase('done');
    if (next.result === 'ok') {
      onOk('/login');
    }
  }

  return (
    <Page title="Complete recovery" links={<UnsignedLinks />}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <TextField label="Email" value={email} onChange={setEmail} />
        <TextField label="New password" value={password} onChange={setPassword} type="password" />
        <TextField label="Proof" value={proof} onChange={setProof} />
        <CommandButton variant="primary" type="submit">
          Complete recovery
        </CommandButton>
      </form>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}

function ProofForm({
  title,
  fields,
  command,
  path,
  build,
  onOk,
}: {
  title: string;
  fields: string[];
  command: string;
  path: string;
  build: (values: Record<string, string>) => unknown;
  onOk?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'done'>('idle');
  const [body, setBody] = useState<ApiBody | undefined>(undefined);

  async function submit() {
    if (phase === 'waiting') {
      return;
    }
    setPhase('waiting');
    const next = await sendJson(path, 'POST', build(values));
    setBody(next);
    setPhase('done');
    if (next.result === 'ok') {
      onOk?.();
    }
  }

  return (
    <Page title={title} links={<UnsignedLinks />}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {fields.map((label) => (
          <TextField
            key={label}
            label={label}
            value={values[label] ?? ''}
            onChange={(value) => setValues((current) => ({ ...current, [label]: value }))}
          />
        ))}
        <CommandButton variant="primary" type="submit">
          {command}
        </CommandButton>
      </form>
      <Result phase={phase} {...(body === undefined ? {} : { body })} />
    </Page>
  );
}
