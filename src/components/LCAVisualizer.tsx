import React from 'react';
import { SimStep } from '../types';

interface LCAVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

const LCAVisualizer: React.FC<LCAVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const firstLine = lines[0].split(/\s+/).map(Number);
	const n = firstLine[0];
	const m = firstLine[1];
	const root = firstLine[2];

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const deep = vars.deep as number[] | undefined;
	const u = vars.u as number | undefined;
	const v = vars.v as number | undefined;
	const result = vars.result as number | undefined;

	// Parse edges and build tree
	const edges: { from: number; to: number }[] = [];
	const children: number[][] = Array.from({ length: n + 1 }, () => []);
	const parent: number[] = new Array(n + 1).fill(0);

	for (let i = 1; i < n && i < lines.length; ++i)
	{
		const parts = lines[i].split(/\s+/).map(Number);
		const u = parts[0], v = parts[1];
		edges.push({ from: u, to: v });
		children[u].push(v);
		children[v].push(u);
		parent[v] = u;
		parent[u] = v;
	}

	// Layout tree using BFS
	const positions: Map<number, { x: number; y: number }> = new Map();
	const visited = new Set<number>();
	const queue: { node: number; depth: number; left: number; right: number }[] = [];
	
	queue.push({ node: root, depth: 0, left: 20, right: 380 });
	visited.add(root);

	while (queue.length > 0)
	{
		const { node, depth, left, right } = queue.shift()!;
		const x = (left + right) / 2;
		const y = 40 + depth * 60;
		positions.set(node, { x, y });

		const unvisitedChildren = children[node].filter(c => !visited.has(c));
		const childWidth = (right - left) / Math.max(1, unvisitedChildren.length);

		unvisitedChildren.forEach((child, idx) =>
		{
			visited.add(child);
			queue.push({
				node: child,
				depth: depth + 1,
				left: left + idx * childWidth,
				right: left + (idx + 1) * childWidth,
			});
		});
	}

	const svgHeight = Math.max(300, (positions.size > 0 ? Math.max(...Array.from(positions.values()).map(p => p.y)) + 80 : 300));

	const getNodeColor = (id: number) =>
	{
		if (id === result) return { fill: '#f59e0b', stroke: '#d97706' };
		if (id === u || id === v) return { fill: '#ec4899', stroke: '#db2777' };
		if (highlight.has(String(id))) return { fill: '#f59e0b', stroke: '#d97706' };
		if (id === root) return { fill: '#22c55e', stroke: '#16a34a' };
		return { fill: '#6366f1', stroke: '#4f46e5' };
	};

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌳</span> LCA 最近公共祖先
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					{/* Edges */}
					{edges.map((edge, idx) =>
					{
						const fromPos = positions.get(edge.from);
						const toPos = positions.get(edge.to);
						if (!fromPos || !toPos) return null;

						const isHL = highlight.has(String(edge.from)) && highlight.has(String(edge.to));

						return (
							<line
								key={`edge-${idx}`}
								x1={fromPos.x} y1={fromPos.y + 18}
								x2={toPos.x} y2={toPos.y - 18}
								stroke={isHL ? '#f59e0b' : '#4b5563'}
								strokeWidth={isHL ? 2.5 : 1.5}
								className="transition-all duration-300"
							/>
						);
					})}

					{/* Nodes */}
					{Array.from(positions.entries()).map(([nodeId, pos]) =>
					{
						const colors = getNodeColor(nodeId);
						const isRoot = nodeId === root;
						const isU = nodeId === u;
						const isV = nodeId === v;
						const isResult = nodeId === result;

						return (
							<g key={`node-${nodeId}`}>
								{highlight.has(String(nodeId)) && (
									<circle
										cx={pos.x} cy={pos.y} r={22}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={18}
									fill={colors.fill}
									stroke={colors.stroke}
									strokeWidth={2}
									className="transition-all duration-300"
								/>
								<text
									x={pos.x} y={pos.y + 4}
									textAnchor="middle"
									fontSize="11"
									fontWeight="bold"
									fill="#fff"
								>
									{nodeId}
								</text>
								{deep && (
									<text
										x={pos.x + 22} y={pos.y - 5}
										textAnchor="start"
										fontSize="8"
										fill="#9ca3af"
									>
										d:{deep[nodeId]}
									</text>
								)}
								{isRoot && (
									<text
										x={pos.x} y={pos.y - 22}
										textAnchor="middle"
										fontSize="9"
										fill="#4ade80"
										fontWeight="bold"
									>
										root
									</text>
								)}
								{isU && (
									<text
										x={pos.x} y={pos.y - 22}
										textAnchor="middle"
										fontSize="9"
										fill="#ec4899"
										fontWeight="bold"
									>
										u
									</text>
								)}
								{isV && (
									<text
										x={pos.x} y={pos.y + 30}
										textAnchor="middle"
										fontSize="9"
										fill="#ec4899"
										fontWeight="bold"
									>
										v
									</text>
								)}
								{isResult && (
									<text
										x={pos.x} y={pos.y - 22}
										textAnchor="middle"
										fontSize="9"
										fill="#f59e0b"
										fontWeight="bold"
									>
										LCA
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			{u !== undefined && v !== undefined && (
				<div className="mt-2 text-xs text-gray-400 text-center">
					查询 LCA({u}, {v})
					{result !== undefined && <span className="text-amber-400 ml-2">= {result}</span>}
				</div>
			)}
		</div>
	);
};

export default LCAVisualizer;
