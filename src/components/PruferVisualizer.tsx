import React from 'react';
import { SimStep } from '../types';

interface PruferVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

interface PruferNode
{
	id: number;
	x: number;
	y: number;
}

const PruferVisualizer: React.FC<PruferVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const firstLine = lines[0].split(/\s+/).map(Number);
	const n = firstLine[0];
	const m = firstLine[1];

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const fa = vars.fa as number[] | undefined;
	const deg = vars.deg as number[] | undefined;
	const p = vars.p as number[] | undefined;
	const f = vars.f as number[] | undefined;

	// Build tree structure
	const children: number[][] = Array.from({ length: n + 1 }, () => []);
	if (fa)
	{
		for (let i = 1; i <= n; ++i)
		{
			if (fa[i] && fa[i] !== i && fa[i] <= n)
			{
				children[fa[i]].push(i);
			}
		}
	}
	else if (f && m === 2)
	{
		// Build tree from father array
		for (let i = 1; i < f.length; ++i)
		{
			const parent = f[i - 1];
			if (parent <= n)
			{
				children[parent].push(i);
			}
		}
	}

	// Find root
	let root = 1;
	if (fa)
	{
		for (let i = 1; i <= n; ++i)
		{
			if (!fa[i] || fa[i] === i || fa[i] > n)
			{
				root = i;
				break;
			}
		}
	}

	// Layout tree
	const positions: Map<number, { x: number; y: number }> = new Map();
	const nodeRadius = 18;

	function layoutTree(node: number, x: number, y: number, width: number, depth: number)
	{
		positions.set(node, { x, y });
		if (children[node].length === 0) return;

		const childWidth = width / children[node].length;
		children[node].forEach((child, idx) =>
		{
			const childX = x - width / 2 + childWidth * (idx + 0.5);
			layoutTree(child, childX, y + 60, childWidth * 0.8, depth + 1);
		});
	}

	layoutTree(root, 200, 40, 360, 0);

	const svgHeight = Math.max(300, (positions.size > 0 ? Math.max(...Array.from(positions.values()).map(p => p.y)) + 80 : 300));

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌳</span> Prufer 序列可视化
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					{/* Edges */}
					{Array.from({ length: n + 1 }, (_, i) => i).slice(1).map(u =>
					{
						return children[u].map(v =>
						{
							const uPos = positions.get(u);
							const vPos = positions.get(v);
							if (!uPos || !vPos) return null;

							const isHL = highlight.has(String(u)) && highlight.has(String(v));

							return (
								<line
									key={`edge-${u}-${v}`}
									x1={uPos.x} y1={uPos.y + nodeRadius}
									x2={vPos.x} y2={vPos.y - nodeRadius}
									stroke={isHL ? '#f59e0b' : '#4b5563'}
									strokeWidth={isHL ? 3 : 1.5}
									className="transition-all duration-300"
								/>
							);
						});
					})}

					{/* Nodes */}
					{Array.from({ length: n + 1 }, (_, i) => i).slice(1).map(u =>
					{
						const pos = positions.get(u);
						if (!pos) return null;

						const isHL = highlight.has(String(u));
						const isLeaf = deg ? deg[u] === 0 : children[u].length === 0;
						const fill = isHL ? '#f59e0b' : isLeaf ? '#10b981' : '#6366f1';
						const stroke = isHL ? '#d97706' : isLeaf ? '#059669' : '#4f46e5';

						return (
							<g key={`node-${u}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 4}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill} stroke={stroke} strokeWidth={2}
									className="transition-all duration-300"
								/>
								<text
									x={pos.x} y={pos.y + 4}
									textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff"
								>
									{u}
								</text>
								{deg && (
									<text
										x={pos.x + nodeRadius + 3} y={pos.y - 5}
										textAnchor="start" fontSize="8" fill="#9ca3af"
									>
										d:{deg[u]}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>

			{/* Prufer sequence display */}
			{p && p.length > 0 && (
				<div className="mt-3">
					<div className="text-xs text-gray-400 mb-1">Prufer 序列:</div>
					<div className="flex gap-1 flex-wrap">
						{p.map((val, idx) => (
							<div
								key={idx}
								className="px-2 py-1 bg-amber-500/20 border border-amber-500 rounded text-xs font-mono text-amber-300"
							>
								{val}
							</div>
						))}
					</div>
				</div>
			)}

			{f && f.length > 0 && (
				<div className="mt-3">
					<div className="text-xs text-gray-400 mb-1">父亲序列:</div>
					<div className="flex gap-1 flex-wrap">
						{f.map((val, idx) => (
							<div
								key={idx}
								className="px-2 py-1 bg-indigo-500/20 border border-indigo-500 rounded text-xs font-mono text-indigo-300"
							>
								{val}
							</div>
						))}
					</div>
				</div>
			)}

			<div className="mt-2 text-[10px] text-gray-500 text-center">
				<span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>叶子节点
				<span className="inline-block w-3 h-3 rounded-full bg-amber-500 ml-3 mr-1"></span>当前处理
			</div>
		</div>
	);
};

export default PruferVisualizer;
