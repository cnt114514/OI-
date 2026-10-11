import React from 'react';
import { SimStep } from '../types';

interface StringVisualizerProps
{
	step: SimStep | null;
	inputText: string;
	algoId: string;
}

const StringVisualizer: React.FC<StringVisualizerProps> = ({ step, inputText, algoId }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const s = vars.s as string | undefined;
	const t = vars.t as string | undefined;
	const i = vars.i as number | undefined;
	const j = vars.j as number | undefined;
	const l = vars.l as number | undefined;
	const r = vars.r as number | undefined;

	const cellSize = 40;
	const gap = 4;

	const renderString = (str: string | undefined, label: string, pointers: { name: string; pos: number; color: string }[]) =>
	{
		if (!str) return null;

		return (
			<div className="mb-4">
				<div className="text-xs text-gray-400 mb-2">{label}:</div>
				<div className="relative" style={{ height: '80px' }}>
					{/* 字符串方块 */}
					<div className="flex" style={{ gap: `${gap}px` }}>
						{str.split('').map((c, idx) =>
						{
							const pos = idx + 1;
							const isInRange = l !== undefined && r !== undefined && pos >= l && pos <= r;
							return (
								<div
									key={idx}
									className={`flex flex-col items-center justify-center border-2 transition-all duration-300 ${
										isInRange
											? 'bg-emerald-500/30 border-emerald-600'
											: 'bg-gray-800 border-gray-600'
									}`}
									style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
								>
									<span className="text-sm font-mono font-bold text-gray-200">{c}</span>
								</div>
							);
						})}
					</div>

					{/* 下标 */}
					<div className="flex mt-1" style={{ gap: `${gap}px` }}>
						{str.split('').map((_, idx) => (
							<div
								key={idx}
								className="text-center text-[10px] text-gray-500 font-mono"
								style={{ width: `${cellSize}px` }}
							>
								{idx + 1}
							</div>
						))}
					</div>

					{/* 指针箭头 */}
					{pointers.map((ptr, idx) =>
					{
						if (ptr.pos === undefined || ptr.pos < 1 || ptr.pos > str.length) return null;
						const x = (ptr.pos - 1) * (cellSize + gap) + cellSize / 2;
						return (
							<div
								key={idx}
								className="absolute flex flex-col items-center"
								style={{
									left: `${x}px`,
									top: '-35px',
									transform: 'translateX(-50%)',
								}}
							>
								<span className={`text-xs font-bold ${ptr.color}`}>{ptr.name}</span>
								<svg width="12" height="20" className={ptr.color.replace('text-', 'fill-')}>
									<path d="M6 0 L6 15 M2 11 L6 15 L10 11" stroke="currentColor" strokeWidth="2" fill="none" />
								</svg>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	// KMP 可视化
	if (algoId === 'kmp')
	{
		const s1 = vars.s1 as string | undefined;
		const s2 = vars.s2 as string | undefined;
		const pi = vars.pi as number[] | undefined;
		const matches = vars.matches as number[] | undefined;

		const pointers1 = i !== undefined && i >= 1 ? [{ name: 'i', pos: i, color: 'text-amber-400' }] : [];
		const pointers2 = j !== undefined && j >= 1 ? [{ name: 'j', pos: j, color: 'text-cyan-400' }] : [];

		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🔍</span> KMP 字符串匹配
				</h3>

				{s1 && (
					<div className="mb-4">
						<div className="text-xs text-gray-400 mb-2">主串 s1 (长度 {s1.length}):</div>
						<div className="relative" style={{ height: '80px' }}>
							<div className="flex" style={{ gap: `${gap}px` }}>
								{s1.split('').map((c, idx) =>
								{
									const pos = idx + 1;
									const isCurrent = i !== undefined && pos === i;
									const isMatched = matches && matches.some(m => pos >= m && pos < m + (s2?.length || 0));
									return (
										<div key={idx} className="flex flex-col items-center">
											<div
												className={`flex flex-col items-center justify-center border-2 transition-all duration-300 ${
													isCurrent
														? 'bg-amber-500 border-amber-600 text-white scale-110'
														: isMatched
															? 'bg-emerald-500/30 border-emerald-600'
															: 'bg-gray-800 border-gray-600'
												}`}
												style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
											>
												<span className="text-sm font-mono font-bold">{c}</span>
											</div>
											<div className="text-[10px] text-gray-500 mt-0.5">{pos}</div>
										</div>
									);
								})}
							</div>

							{pointers1.map((ptr, idx) =>
							{
								if (ptr.pos === undefined || ptr.pos < 1 || ptr.pos > s1.length) return null;
								const x = (ptr.pos - 1) * (cellSize + gap) + cellSize / 2;
								return (
									<div
										key={idx}
										className="absolute flex flex-col items-center animate-bounce"
										style={{
											left: `${x}px`,
											top: '-35px',
											transform: 'translateX(-50%)',
										}}
									>
										<span className={`text-xs font-bold ${ptr.color}`}>{ptr.name}</span>
										<svg width="12" height="20" className={ptr.color.replace('text-', 'fill-')}>
											<path d="M6 0 L6 15 M2 11 L6 15 L10 11" stroke="currentColor" strokeWidth="2" fill="none" />
										</svg>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{s2 && (
					<div className="mb-4">
						<div className="text-xs text-gray-400 mb-2">模式串 s2 (长度 {s2.length}):</div>
						<div className="relative" style={{ height: '80px' }}>
							<div className="flex" style={{ gap: `${gap}px` }}>
								{s2.split('').map((c, idx) =>
								{
									const pos = idx + 1;
									const isCurrent = j !== undefined && pos === j;
									return (
										<div key={idx} className="flex flex-col items-center">
											<div
												className={`flex flex-col items-center justify-center border-2 transition-all duration-300 ${
													isCurrent
														? 'bg-cyan-500 border-cyan-600 text-white scale-110'
														: 'bg-indigo-500/30 border-indigo-600'
												}`}
												style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
											>
												<span className="text-sm font-mono font-bold">{c}</span>
											</div>
											<div className="text-[10px] text-gray-500 mt-0.5">{pos}</div>
										</div>
									);
								})}
							</div>

							{pointers2.map((ptr, idx) =>
							{
								if (ptr.pos === undefined || ptr.pos < 1 || ptr.pos > s2.length) return null;
								const x = (ptr.pos - 1) * (cellSize + gap) + cellSize / 2;
								return (
									<div
										key={idx}
										className="absolute flex flex-col items-center animate-bounce"
										style={{
											left: `${x}px`,
											top: '-35px',
											transform: 'translateX(-50%)',
										}}
									>
										<span className={`text-xs font-bold ${ptr.color}`}>{ptr.name}</span>
										<svg width="12" height="20" className={ptr.color.replace('text-', 'fill-')}>
											<path d="M6 0 L6 15 M2 11 L6 15 L10 11" stroke="currentColor" strokeWidth="2" fill="none" />
										</svg>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{pi && (
					<div className="mt-3">
						<div className="text-xs text-gray-400 mb-2">pi 数组 (前缀函数):</div>
						<div className="flex" style={{ gap: `${gap}px` }}>
							{pi.slice(1).map((v, idx) => (
								<div key={idx} className="flex flex-col items-center">
									<div
										className="flex flex-col items-center justify-center bg-purple-500/30 border border-purple-600 transition-all duration-300"
										style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
									>
										<span className="text-xs font-mono text-purple-300 font-bold">{v}</span>
									</div>
									<div className="text-[10px] text-gray-500 mt-0.5">{idx + 1}</div>
								</div>
							))}
						</div>
					</div>
				)}

				{matches && matches.length > 0 && (
					<div className="mt-3">
						<div className="text-xs text-gray-400 mb-2">匹配位置:</div>
						<div className="flex gap-2 flex-wrap">
							{matches.map((m, idx) => (
								<div key={idx} className="px-2 py-1 bg-emerald-500/20 border border-emerald-600 rounded text-xs font-mono text-emerald-300">
									位置 {m}
								</div>
							))}
						</div>
					</div>
				)}

				<div className="mt-3 text-[10px] text-gray-500 text-center">
					<span className="inline-block w-3 h-3 rounded bg-amber-500 mr-1"></span>主串当前位置
					<span className="inline-block w-3 h-3 rounded bg-cyan-500 ml-3 mr-1"></span>模式串当前位置
					<span className="inline-block w-3 h-3 rounded bg-emerald-500/30 ml-3 mr-1"></span>已匹配
				</div>
			</div>
		);
	}

	// Manacher 可视化
	if (algoId === 'manacher')
	{
		const d = vars.d as number[] | undefined;

		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🔄</span> Manacher 最长回文子串
				</h3>

				{s && renderString(s, '处理后的字符串', [
					{ name: 'i', pos: i || 0, color: 'text-amber-400' }
				])}

			{l !== undefined && r !== undefined && l > 0 && r > 0 && (
				<div className="text-xs text-gray-400 mt-2">
					当前回文中心: i={i}, 边界: [{l}, {r}]
				</div>
			)}
				{d && (
					<div className="mt-3">
						<div className="text-xs text-gray-400 mb-2">d 数组 (回文半径):</div>
						<div className="flex flex-wrap" style={{ gap: `${gap}px` }}>
							{d.slice(0, 30).map((v, idx) => (
								<div
									key={idx}
									className={`flex items-center justify-center border transition-all duration-300 ${
										idx === i
											? 'bg-amber-500/50 border-amber-600 scale-110'
											: 'bg-gray-800 border-gray-600'
									}`}
									style={{ width: `${cellSize}px`, height: `${cellSize / 1.5}px` }}
								>
									<span className="text-[10px] font-mono text-gray-300 font-bold">{v}</span>
								</div>
							))}
							{d.length > 30 && <div className="text-xs text-gray-600 self-center ml-1">...</div>}
						</div>
					</div>
				)}
			</div>
		);
	}

	// exKMP (Z 函数) 可视化
	if (algoId === 'zfunction')
	{
		const z = vars.z as number[] | undefined;
		const p = vars.p as number[] | undefined;

		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>📊</span> Z 函数 (exKMP)
				</h3>

				{t && (
					<div className="mb-4">
						<div className="text-xs text-gray-400 mb-2">字符串 t (长度 {t.length}):</div>
						<div className="relative" style={{ height: '80px' }}>
							<div className="flex" style={{ gap: `${gap}px` }}>
								{t.split('').map((c, idx) =>
								{
									const pos = idx + 1;
									const isCurrent = i !== undefined && pos === i;
									const inRange = l !== undefined && r !== undefined && pos >= l && pos <= r;
									return (
										<div key={idx} className="flex flex-col items-center">
											<div
												className={`flex flex-col items-center justify-center border-2 transition-all duration-300 ${
													isCurrent
														? 'bg-amber-500 border-amber-600 text-white scale-110'
														: inRange
															? 'bg-emerald-500/30 border-emerald-600'
															: 'bg-gray-800 border-gray-600'
												}`}
												style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
											>
												<span className="text-sm font-mono font-bold">{c}</span>
											</div>
											<div className="text-[10px] text-gray-500 mt-0.5">{pos}</div>
										</div>
									);
								})}
							</div>

							{i !== undefined && i > 0 && i <= t.length && (
								<div
									className="absolute flex flex-col items-center animate-bounce"
									style={{
										left: `${(i - 1) * (cellSize + gap) + cellSize / 2}px`,
										top: '-35px',
										transform: 'translateX(-50%)',
									}}
								>
									<span className="text-xs font-bold text-amber-400">i</span>
									<svg width="12" height="20" className="fill-amber-400">
										<path d="M6 0 L6 15 M2 11 L6 15 L10 11" stroke="currentColor" strokeWidth="2" fill="none" />
									</svg>
								</div>
							)}
						</div>
					</div>
				)}

				{z && (
					<div className="mt-3">
						<div className="text-xs text-gray-400 mb-2">z 数组:</div>
						<div className="flex flex-wrap" style={{ gap: `${gap}px` }}>
							{z.slice(1).map((v, idx) => (
								<div key={idx} className="flex flex-col items-center">
									<div
										className={`flex items-center justify-center border transition-all duration-300 ${
											idx + 1 === i
												? 'bg-amber-500/50 border-amber-600 scale-110'
												: 'bg-purple-500/30 border-purple-600'
										}`}
										style={{ width: `${cellSize}px`, height: `${cellSize / 1.5}px` }}
									>
										<span className="text-[10px] font-mono text-purple-300 font-bold">{v}</span>
									</div>
									<div className="text-[10px] text-gray-500 mt-0.5">{idx + 1}</div>
								</div>
							))}
						</div>
					</div>
				)}

				{l !== undefined && r !== undefined && (
					<div className="text-xs text-gray-400 mt-2">
						当前匹配区间: [{l}, {r}]
					</div>
				)}
			</div>
		);
	}

	return null;
};

export default StringVisualizer;
