import React, { useMemo } from 'react';
import { SimStep } from '../types';

interface TrieVisualizerProps
{
	step: SimStep | null;
	inputText: string;
	algoId: string;
}

const TrieVisualizer: React.FC<TrieVisualizerProps> = ({ step, inputText, algoId }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const idx = vars.idx as number | undefined;
	const s = vars.s as string | undefined;

	if (idx === undefined || idx === 0) return null;

	// Build trie structure from the algorithm steps
	// For simplicity, we'll create a basic tree layout
	const positions = useMemo<Map<number, { x: number; y: number }>>(() =>
	{
		const pos = new Map<number, { x: number; y: number }>();
		
		// Simple layout: root at top, children spread below
		const nodeRadius = 18;
		const levelHeight = 60;
		
		// Calculate depth for each node (simplified)
		const depth = Math.ceil(Math.log2(idx + 1)) + 1;
		
		// Place nodes in a tree-like structure
		let currentY = 40;
		let nodesInLevel = 1;
		let nodeIndex = 1;
		
		for (let level = 0; level <= depth && nodeIndex <= idx; ++level)
		{
			const totalWidth = (nodesInLevel - 1) * 50;
			const startX = 200 - totalWidth / 2;
			
			for (let i = 0; i < nodesInLevel && nodeIndex <= idx; ++i)
			{
				pos.set(nodeIndex, { x: startX + i * 50, y: currentY });
				nodeIndex++;
			}
			
			currentY += levelHeight;
			nodesInLevel *= 2;
		}
		
		return pos;
	}, [idx]);

	const svgHeight = useMemo(() =>
	{
		const maxY = Math.max(...Array.from(positions.values()).map(p => p.y));
		return Math.max(300, maxY + 80);
	}, [positions]);

	const nodeRadius = 18;

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌳</span> {algoId === 'trie' ? 'Trie 字典树' : 'AC 自动机'}
			</h3>
			{s && (
				<div className="mb-2 text-xs text-gray-400">
					当前字符串: <span className="text-cyan-400 font-mono">"{s}"</span>
				</div>
			)}
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					{/* Edges - simplified parent-child connections */}
					{Array.from({ length: idx }, (_, i) => i + 1).map(nodeId =>
					{
						const parent = Math.floor(nodeId / 2);
						if (parent === 0) return null;
						
						const fromPos = positions.get(parent);
						const toPos = positions.get(nodeId);
						if (!fromPos || !toPos) return null;

						const isHL = highlight.has(String(nodeId)) || highlight.has(String(parent));

						return (
							<line
								key={`edge-${nodeId}`}
								x1={fromPos.x} y1={fromPos.y + nodeRadius}
								x2={toPos.x} y2={toPos.y - nodeRadius}
								stroke={isHL ? '#f59e0b' : '#6b7280'}
								strokeWidth={isHL ? 2 : 1.5}
							/>
						);
					})}

					{/* Nodes */}
					{Array.from({ length: idx }, (_, i) => i + 1).map(nodeId =>
					{
						const pos = positions.get(nodeId);
						if (!pos) return null;

						const isHL = highlight.has(String(nodeId));
						const isRoot = nodeId === 1;
						const fill = isHL ? '#f59e0b' : isRoot ? '#22c55e' : '#6366f1';
						const stroke = isHL ? '#d97706' : isRoot ? '#16a34a' : '#4f46e5';

						return (
							<g key={`node-${nodeId}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 4}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill}
									stroke={stroke}
									strokeWidth={2}
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
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center">
				<span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>根节点
				<span className="inline-block w-3 h-3 rounded-full bg-amber-500 ml-3 mr-1"></span>当前节点
				<span className="inline-block text-gray-400 ml-3">节点数: {idx}</span>
			</div>
		</div>
	);
};

export default TrieVisualizer;
