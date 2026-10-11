import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward } from 'lucide-react';

interface ControlPanelProps
{
	isRunning: boolean;
	isPaused: boolean;
	stepIdx: number;
	totalSteps: number;
	speed: number;
	onPlay: () => void;
	onPause: () => void;
	onNext: () => void;
	onPrev: () => void;
	onReset: () => void;
	onFastForward: () => void;
	onSpeed: (s: number) => void;
	onSeek: (step: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = (props) =>
{
	const {
		isRunning, isPaused, stepIdx, totalSteps, speed,
		onPlay, onPause, onNext, onPrev, onReset, onFastForward, onSpeed, onSeek
	} = props;

	return (
		<div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">模拟控制</h3>
				<span className="text-xs text-gray-500 font-mono">
					{totalSteps > 0 ? `${stepIdx + 1} / ${totalSteps}` : '就绪'}
				</span>
			</div>

			<div className="mb-4">
				<input
					type="range"
					min="0"
					max={Math.max(0, totalSteps - 1)}
					value={stepIdx}
					onChange={(e) => onSeek(Number(e.target.value))}
					disabled={totalSteps === 0}
					className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
					style={{
						background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(168 85 247) ${totalSteps > 0 ? ((stepIdx + 1) / totalSteps) * 100 : 0}%, rgb(55 65 81) ${totalSteps > 0 ? ((stepIdx + 1) / totalSteps) * 100 : 0}%, rgb(55 65 81) 100%)`
					}}
				/>
			</div>

			<div className="flex items-center justify-center gap-2 mb-4">
				<button onClick={onReset} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors" title="重置">
					<RotateCcw size={16} />
				</button>
				<button onClick={onPrev} disabled={stepIdx <= 0} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors disabled:opacity-30" title="上一步">
					<SkipBack size={16} />
				</button>
				{isRunning && !isPaused ? (
					<button onClick={onPause} className="p-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-colors" title="暂停">
						<Pause size={20} />
					</button>
				) : (
					<button onClick={onPlay} disabled={totalSteps === 0} className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-30" title="运行">
						<Play size={20} />
					</button>
				)}
				<button onClick={onNext} disabled={stepIdx >= totalSteps - 1} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors disabled:opacity-30" title="下一步">
					<SkipForward size={16} />
				</button>
				<button onClick={onFastForward} disabled={totalSteps === 0} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors disabled:opacity-30" title="快进">
					<FastForward size={16} />
				</button>
			</div>

			<div className="flex items-center gap-3">
				<span className="text-[11px] text-gray-500">速度</span>
				<input
					type="range"
					min="100"
					max="2000"
					step="100"
					value={2100 - speed}
					onChange={(e) => onSpeed(2100 - Number(e.target.value))}
					className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
				/>
				<span className="text-[11px] text-gray-500 font-mono w-12 text-right">{speed}ms</span>
			</div>
		</div>
	);
};

export default ControlPanel;
