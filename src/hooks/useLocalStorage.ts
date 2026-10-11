import { useCallback, useSyncExternalStore } from 'react';

/**
 * 轻量级 localStorage 状态钩子。
 * - 使用 useSyncExternalStore，天然兼容 React 并发渲染；
 * - 同页面多组件共享同一 key 时自动同步（自定义事件广播）；
 * - 读写全部包裹 try/catch，隐私模式 / 配额溢出不会导致应用崩溃。
 */

const listeners = new Map<string, Set<() => void>>();
const stringCache = new Map<string, string | null>();

function notify(key: string) {
  stringCache.delete(key);
  listeners.get(key)?.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key) notify(e.key);
  });
  window.addEventListener(
    'local-storage-sync',
    ((e: Event) => {
      const detail = (e as CustomEvent<{ key?: string }>).detail;
      if (detail?.key) notify(detail.key);
    }) as EventListener,
  );
}

function subscribeFactory(key: string) {
  return (callback: () => void) => {
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(callback);
    return () => {
      set!.delete(callback);
      if (set!.size === 0) listeners.delete(key);
    };
  };
}

function getSnapshot<T>(key: string, fallback: T): T {
  if (!stringCache.has(key)) {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    stringCache.set(key, raw);
  }
  const raw = stringCache.get(key)!;
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  fallback: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    subscribeFactory(key),
    () => getSnapshot(key, fallback),
    () => fallback,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(getSnapshot(key, fallback)) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* 存储不可用时静默降级为内存态 */
      }
      notify(key);
      window.dispatchEvent(new CustomEvent('local-storage-sync', { detail: { key } }));
    },
    [key, fallback],
  );

  return [value, setValue];
}
