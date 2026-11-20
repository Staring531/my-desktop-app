import { describe, expect, it } from 'vitest';
import { showIfRegistered, startOwner } from './owner.js';

describe('single instance', () => {
  it('exits without reading or focusing when the lock is not acquired', () => {
    const calls: string[] = [];
    startOwner({
      requestLock: () => {
        calls.push('lock');
        return false;
      },
      onSecondInstance: () => calls.push('second'),
      quit: () => calls.push('quit'),
      whenReady: () => calls.push('ready'),
      onActivate: () => undefined,
      onAllClosed: () => undefined,
      platform: 'darwin',
      begin: () => {
        calls.push('read');
        return {
          openWindow: () => calls.push('focus'),
          focusWriter: () => calls.push('focus'),
          windowCount: () => 0,
        };
      },
    });
    expect(calls).toEqual(['lock', 'quit']);
  });

  it('takes the lock before the first read and focuses on second-instance without writing', () => {
    const calls: string[] = [];
    let second: (() => void) | undefined;
    startOwner({
      requestLock: () => {
        calls.push('lock');
        return true;
      },
      onSecondInstance: (handler) => {
        second = handler;
      },
      quit: () => calls.push('quit'),
      whenReady: (start) => start(),
      onActivate: () => undefined,
      onAllClosed: () => undefined,
      platform: 'linux',
      begin: () => {
        calls.push('read');
        return {
          openWindow: () => calls.push('open'),
          focusWriter: () => calls.push('focus'),
          windowCount: () => 1,
        };
      },
    });
    expect(calls.indexOf('lock')).toBeLessThan(calls.indexOf('read'));
    second?.();
    expect(calls).toContain('focus');
    expect(calls).not.toContain('quit');
  });

  it('does not show a window the coordinator did not register', () => {
    const shown: string[] = [];
    const registered = new Set(['owned']);
    showIfRegistered({ id: 'stray', show: () => shown.push('stray') }, registered);
    showIfRegistered({ id: 'owned', show: () => shown.push('owned') }, registered);
    expect(shown).toEqual(['owned']);
  });
});
