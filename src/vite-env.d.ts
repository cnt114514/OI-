/// <reference types="vite/client" />

/** 算法模块：默认导出 AlgoDef，或命名导出 xxxAlgo（由 algorithms/index.ts 聚合） */
declare module '*/algorithms/*' {
  import type { AlgoDef } from './types';
  const algo: AlgoDef;
  export default algo;
}
