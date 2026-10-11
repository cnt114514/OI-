import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { AlgoDef, SimStep } from './types';
import { allAlgorithms } from './algorithms';
import CodeDisplay from './components/CodeDisplay';
import VariablePanel from './components/VariablePanel';
import ControlPanel from './components/ControlPanel';
import StepLog from './components/StepLog';
import CommentSection from './components/CommentSection';
import { validateInput, validateSteps, DEFAULT_CONFIG } from './utils/validation';
import { useLocalStorage } from './hooks/useLocalStorage';

/* 各算法专属可视化组件按需懒加载：仅在对应算法被选中并产生步骤时才下载其 chunk，显著减小首屏 JS 体积 */
const TreapVisualizer = lazy(() => import('./components/TreapVisualizer'));
const GraphVisualizer = lazy(() => import('./components/GraphVisualizer'));
const StringVisualizer = lazy(() => import('./components/StringVisualizer'));
const BITVisualizer = lazy(() => import('./components/BITVisualizer'));
const SegTreeVisualizer = lazy(() => import('./components/SegTreeVisualizer'));
const NetworkFlowVisualizer = lazy(() => import('./components/NetworkFlowVisualizer'));
const TreeChainVisualizer = lazy(() => import('./components/TreeChainVisualizer'));
const SAMVisualizer = lazy(() => import('./components/SAMVisualizer'));
const GSAMVisualizer = lazy(() => import('./components/GSAMVisualizer'));
const ACVisualizer = lazy(() => import('./components/ACVisualizer'));
const TrieVisualizer = lazy(() => import('./components/TrieVisualizer'));
const PruferVisualizer = lazy(() => import('./components/PruferVisualizer'));
const TarjanSCCVisualizer = lazy(() => import('./components/TarjanSCCVisualizer'));
const LCAVisualizer = lazy(() => import('./components/LCAVisualizer'));
const SplayVisualizer = lazy(() => import('./components/SplayVisualizer'));
const MatrixVisualizer = lazy(() => import('./components/MatrixVisualizer'));
const EdmondsVisualizer = lazy(() => import('./components/EdmondsVisualizer'));

type AnyViz = LazyExoticComponent<ComponentType<any>>;

const FLOW_IDS = ['ek', 'dinic', 'hlpp', 'mcmf'];

/** 各算法 id -> 专属可视化组件 */
const VISUALIZER_BY_ID: Record<string, AnyViz> = {
  treap: TreapVisualizer,
  'fhq-treap': TreapVisualizer,
  ek: NetworkFlowVisualizer,
  dinic: NetworkFlowVisualizer,
  hlpp: NetworkFlowVisualizer,
  mcmf: NetworkFlowVisualizer,
  bit: BITVisualizer,
  segtree: SegTreeVisualizer,
  treechain: TreeChainVisualizer,
  sam: SAMVisualizer,
  gsam: GSAMVisualizer,
  acautomaton: ACVisualizer,
  trie: TrieVisualizer,
  prufer: PruferVisualizer,
  tarjanscc: TarjanSCCVisualizer,
  'lca-binary-lifting': LCAVisualizer,
  lcatarjan: LCAVisualizer,
  splay: SplayVisualizer,
  gauss: MatrixVisualizer,
  'matrix-inverse': MatrixVisualizer,
  edmonds: EdmondsVisualizer,
};

/** 返回可视化组件及其所需 props（按组件契约精确传参） */
function resolveVisualizer(algo: AlgoDef, step: SimStep, inputText: string) {
  const comp = VISUALIZER_BY_ID[algo.id];
  if (comp) {
    const needsInput = ['treechain', 'sam', 'gsam', 'acautomaton', 'trie', 'prufer', 'tarjanscc', 'lca-binary-lifting', 'lcatarjan'].includes(algo.id);
    const needsAlgoId = ['treap', 'fhq-treap', ...FLOW_IDS, 'trie'].includes(algo.id);
    return {
      Comp: comp,
      props: { step, ...(needsInput ? { inputText } : {}), ...(needsAlgoId ? { algoId: algo.id } : {}) },
    };
  }
  if (algo.category === 'graph' && !FLOW_IDS.includes(algo.id)) {
    return { Comp: GraphVisualizer as AnyViz, props: { step, inputText, algoId: algo.id } };
  }
  if (algo.category === 'string') {
    return { Comp: StringVisualizer as AnyViz, props: { step, inputText, algoId: algo.id } };
  }
  return null;
}

function VisualizerFallback() {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 text-center text-xs text-gray-500 animate-pulse">
      正在加载可视化组件…
    </div>
  );
}

type CategoryKey = 'math' | 'graph' | 'tree' | 'string' | 'dp';

const CATEGORY_ORDER: CategoryKey[] = ['math', 'graph', 'tree', 'string', 'dp'];

const CATEGORY_META: Record<CategoryKey, { label: string; icon: string; selected: string; idle: string }> = {
  math: {
    label: '数学',
    icon: '🔢',
    selected: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 border-emerald-500',
    idle: 'border-gray-700 hover:bg-emerald-600/20 hover:text-emerald-300',
  },
  graph: {
    label: '图论',
    icon: '🔗',
    selected: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border-indigo-500',
    idle: 'border-gray-700 hover:bg-indigo-600/20 hover:text-indigo-300',
  },
  tree: {
    label: '树论',
    icon: '🌳',
    selected: 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 border-purple-500',
    idle: 'border-gray-700 hover:bg-purple-600/20 hover:text-purple-300',
  },
  string: {
    label: '字符串',
    icon: '📝',
    selected: 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 border-cyan-500',
    idle: 'border-gray-700 hover:bg-cyan-600/20 hover:text-cyan-300',
  },
  dp: {
    label: '动态规划',
    icon: '📊',
    selected: 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 border-rose-500',
    idle: 'border-gray-700 hover:bg-rose-600/20 hover:text-rose-300',
  },
};

function App() {
  /* 上次浏览的算法与播放速度持久化到本地 */
  const [savedAlgoId, persistAlgo] = useLocalStorage<string>('av:last-algo', allAlgorithms[0].id);
  const initialIdx = Math.max(0, allAlgorithms.findIndex((a) => a.id === savedAlgoId));

  const [selectedAlgo, setSelectedAlgo] = useState(initialIdx);
  const [inputText, setInputText] = useState(allAlgorithms[initialIdx].defaultInput);
  const [steps, setSteps] = useState<SimStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useLocalStorage('av:speed', 800);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const algo = allAlgorithms[selectedAlgo];
  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  /* 分类分组只计算一次，避免每次渲染重复 filter + indexOf（O(n²)） */
  const grouped = useMemo(() => {
    const map = new Map<CategoryKey, { algo: AlgoDef; idx: number }[]>();
    CATEGORY_ORDER.forEach((c) => map.set(c, []));
    allAlgorithms.forEach((a, idx) => {
      map.get(a.category as CategoryKey)?.push({ algo: a, idx });
    });
    return map;
  }, []);

  const viz = currentStep ? resolveVisualizer(algo, currentStep, inputText) : null;

  /* 切换算法：重置状态并恢复默认输入 */
  useEffect(() => {
    setInputText(algo.defaultInput);
    setSteps([]);
    setStepIdx(-1);
    setIsRunning(false);
    setIsPaused(false);
    setError(null);
    persistAlgo(algo.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgo]);

  /* 播放循环 */
  useEffect(() => {
    if (isRunning && !isPaused && stepIdx < steps.length - 1) {
      timerRef.current = setTimeout(() => setStepIdx((prev) => prev + 1), speed);
    } else if (stepIdx >= steps.length - 1 && isRunning) {
      setIsRunning(false);
      setIsPaused(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, isPaused, stepIdx, steps.length, speed]);

  const handleRun = useCallback(() => {
    setError(null);

    const inputValidation = validateInput(inputText, DEFAULT_CONFIG);
    if (!inputValidation.valid) {
      setError(inputValidation.error || '输入验证失败');
      return;
    }

    const startTime = performance.now();
    let newSteps: SimStep[];
    try {
      newSteps = algo.run(inputText);
    } catch (e) {
      setError(`算法执行出错: ${e instanceof Error ? e.message : '未知错误'}`);
      return;
    }

    const executionTime = performance.now() - startTime;
    if (executionTime > DEFAULT_CONFIG.maxExecutionTime) {
      setError(`执行时间过长（${(executionTime / 1000).toFixed(2)}秒），请减小输入规模`);
      return;
    }

    const stepsValidation = validateSteps(newSteps, DEFAULT_CONFIG);
    if (!stepsValidation.valid) {
      setError(stepsValidation.error || '步骤数验证失败');
      return;
    }

    setSteps(newSteps);
    setStepIdx(0);
    setIsRunning(true);
    setIsPaused(false);
  }, [algo, inputText]);

  const handlePlay = useCallback(() => {
    if (steps.length === 0) {
      handleRun();
    } else if (stepIdx >= steps.length - 1) {
      setStepIdx(0);
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsPaused(false);
    }
  }, [steps.length, stepIdx, handleRun]);

  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleNext = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setStepIdx((p) => Math.min(p + 1, steps.length - 1));
  }, [steps.length]);
  const handlePrev = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setStepIdx((p) => Math.max(p - 1, 0));
  }, []);
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setStepIdx(-1);
    setSteps([]);
  }, []);
  const handleFF = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);
  const handleSeek = useCallback((step: number) => {
    setIsRunning(false);
    setIsPaused(false);
    setStepIdx(step);
  }, []);

  /* 键盘快捷键：空格播放/暂停，←/→ 单步，R 重置，Ctrl/Cmd+Enter 运行 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT');
      if (e.key === ' ' && !typing) {
        e.preventDefault();
        if (isRunning && !isPaused) handlePause();
        else handlePlay();
      } else if (e.key === 'ArrowRight' && !typing) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && !typing) {
        handlePrev();
      } else if ((e.key === 'r' || e.key === 'R') && !typing && !e.metaKey && !e.ctrlKey) {
        handleReset();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePlay, handlePause, handleNext, handlePrev, handleReset, handleRun, isRunning, isPaused]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
              Σ
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                算法可视化学习平台
              </h1>
              <p className="text-[10px] text-gray-500">
                Algorithm Visualizer — 支持 {allAlgorithms.length} 种经典算法
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-500">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono">Space</kbd> 播放/暂停
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono">← →</kbd> 单步
            <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 font-mono">Ctrl+Enter</kbd> 运行
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-4">
        {/* 算法选择区域 */}
        <div className="mb-4 space-y-3">
          {CATEGORY_ORDER.map((category) => {
            const algos = grouped.get(category) ?? [];
            if (algos.length === 0) return null;
            const meta = CATEGORY_META[category];
            return (
              <div key={category} className="bg-gray-800/30 rounded-lg border border-gray-700/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{meta.icon}</span>
                  <h3 className="text-xs font-semibold text-gray-300">{meta.label}</h3>
                  <span className="text-[10px] text-gray-500">({algos.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {algos.map(({ algo: a, idx }) => {
                    const isSelected = selectedAlgo === idx;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAlgo(idx)}
                        aria-pressed={isSelected}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-gray-800 border ${
                          isSelected ? `${meta.selected} text-white` : `text-gray-400 ${meta.idle}`
                        }`}
                      >
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 px-4 py-2">
            <p className="text-xs text-gray-400">{algo.desc}</p>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4" role="alert">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <span className="text-red-400 text-lg">⚠️</span>
                <div>
                  <h3 className="text-sm font-semibold text-red-400 mb-1">输入验证失败</h3>
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                aria-label="关闭错误提示"
                className="text-red-400 hover:text-red-300 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
              <span className="text-xs text-gray-400 font-medium">📥 样例输入</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono ${
                    inputText.length > DEFAULT_CONFIG.maxInputSize ? 'text-red-400' : 'text-gray-500'
                  }`}
                >
                  {inputText.length} / {DEFAULT_CONFIG.maxInputSize} 字符
                </span>
                <button
                  onClick={handleRun}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md transition-colors"
                >
                  ▶ 运行
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 bg-gray-950 p-3 text-xs font-mono text-gray-300 placeholder-gray-700 focus:outline-none resize-none"
              placeholder="粘贴题目输入数据..."
              spellCheck={false}
            />
          </div>

          <ControlPanel
            isRunning={isRunning}
            isPaused={isPaused}
            stepIdx={stepIdx}
            totalSteps={steps.length}
            speed={speed}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNext}
            onPrev={handlePrev}
            onReset={handleReset}
            onFastForward={handleFF}
            onSpeed={setSpeed}
            onSeek={handleSeek}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <CodeDisplay code={algo.code} currentLine={currentStep?.line || 0} />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {currentStep && (
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-300 flex items-center gap-2">
                    <span>💬</span> 当前步骤
                  </h3>
                  <span className="text-[10px] bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full">
                    行 {currentStep.line ?? '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  {currentStep.desc}
                </p>
              </div>
            )}

            {viz && (
              <Suspense fallback={<VisualizerFallback />}>
                <viz.Comp key={`vz-${algo.id}`} {...viz.props} />
              </Suspense>
            )}

            <VariablePanel step={currentStep} />

            {steps.length > 0 && <StepLog steps={steps} currentIdx={stepIdx} />}
          </div>
        </div>

        {/* 评论区 */}
        <CommentSection algoId={algo.id} algoName={algo.name} />
      </main>

      <footer className="border-t border-gray-800 mt-8 py-3">
        <div className="max-w-[1400px] mx-auto px-4 text-center text-[10px] text-gray-600">
          算法可视化学习平台 — 支持 {allAlgorithms.length} 种经典算法的动态模拟演示
        </div>
      </footer>
    </div>
  );
}

export default App;
