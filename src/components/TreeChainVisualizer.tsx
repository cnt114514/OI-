import React from 'react';
import { SimStep } from '../types';

interface TreeChainVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

interface TCNode
{
	id: number;
	x: number;
	y: number;
}

const TreeChainVisualizer: React.FC<TreeChainVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const firstLine = lines[0].split(/\s+/).map(Number);
	const n = firstLine[0];
	const r = firstLine[2] || 1;

	// Parse edges
	const edges: { u: number; v: number }[] = [];
	for (let i = 2; i <= n && i < lines.length; ++i)
	{
		const parts = lines[i].split(/\s+/).map(Number);
		edges.push({ u: parts[0], v: parts[1] });
	}

	// Build tree structure
	const children: number[][] = Array.from({ length: n + 1 }, () => []);
	const parent: number[] = new Array(n + 1).fill(0);
	const visited = new Set<number>();

	function buildTree(u: number, p: number)
	{
		visited.add(u);
		parent[u] = p;
		for (const e of edges)
		{
			let v = 0;
			if (e.u === u && !visited.has(e.v)) v = e.v;
			else if (e.v === u && !visited.has(e.u)) v = e.u;
			if (v)
			{
				children[u].push(v);
				buildTree(v, u);
			}
		}
	}

	buildTree(r, 0);

	// Calculate subtree sizes
	const siz: number[] = new Array(n + 1).fill(1);
	function calcSize(u: number)
	{
		for (const v of children[u])
		{
			calcSize(v);
			siz[u] += siz[v];
		}
	}
	calcSize(r);

	// Find heavy children
	const son: number[] = new Array(n + 1).fill(0);
	function findHeavy(u: number)
	{
		let maxSiz = 0;
		for (const v of children[u])
		{
			findHeavy(v);
			if (siz[v] > maxSiz)
			{
				maxSiz = siz[v];
				son[u] = v;
			}
		}
	}
	findHeavy(r);

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

	layoutTree(r, 200, 40, 360, 0);

	const svgHeight = Math.max(300, (positions.size > 0 ? Math.max(...Array.from(positions.values()).map(p => p.y)) + 80 : 300));

	// Get highlight info
	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const fa = vars.fa as number[] | undefined;
	const top = vars.top as number[] | undefined;
	const dfn = vars.dfn as number[] | undefined;
	const dep = vars.dep as number[] | undefined;
	const sizArr = vars.siz as number[] | undefined;
	const sonArr = vars.son as number[] | undefined;

	// Check if edge is heavy
	const isHeavyEdge = (u: number, v: number): boolean =>
	{
		return sonArr ? sonArr[u] === v : son[u] === v;
	};

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌳</span> 树链剖分可视化
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

							const isHeavy = isHeavyEdge(u, v);
							const isHL = highlight.has(String(u)) && highlight.has(String(v));

							return (
								<line
									key={`edge-${u}-${v}`}
									x1={uPos.x} y1={uPos.y + nodeRadius}
									x2={vPos.x} y2={vPos.y - nodeRadius}
									stroke={isHL ? '#f59e0b' : isHeavy ? '#10b981' : '#4b5563'}
									strokeWidth={isHL ? 3 : isHeavy ? 2.5 : 1.5}
									strokeDasharray={isHeavy ? '' : '4,4'}
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
						const isRoot = u === r;
						const fill = isHL ? '#f59e0b' : isRoot ? '#22c55e' : '#6366f1';
						const stroke = isHL ? '#d97706' : isRoot ? '#16a34a' : '#4f46e5';

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
								{dep && (
									<text
										x={pos.x + nodeRadius + 3} y={pos.y - 5}
										textAnchor="start" fontSize="8" fill="#9ca3af"
									>
										d:{dep[u]}
									</text>
								)}
								{sizArr && (
									<text
										x={pos.x + nodeRadius + 3} y={pos.y + 5}
										textAnchor="start" fontSize="8" fill="#9ca3af"
									>
										s:{sizArr[u]}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center">
				<span className="inline-block w-3 h-0.5 bg-emerald-500 mr-1"></span>重边
				<span className="inline-block w-3 h-0.5 bg-gray-500 ml-3 mr-1" style={{ borderTop: '1px dashed' }}></span>轻边
				<span className="inline-block w-3 h-3 rounded-full bg-amber-500 ml-3 mr-1"></span>当前节点
			</div>
		</div>
	);
};

export default TreeChainVisualizer;
