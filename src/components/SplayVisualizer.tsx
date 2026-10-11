import React from 'react';
import { SimStep } from '../types';

interface SplayVisualizerProps
{
	step: SimStep | null;
}

const SplayVisualizer: React.FC<SplayVisualizerProps> = ({ step }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const tree = vars.tree as { root: number; nodes: { id: number; val: number; ls: number; rs: number; siz: number }[] } | undefined;
	const seq = vars.seq as number[] | undefined;
	const l = vars.l as number | undefined;
	const r = vars.r as number | undefined;

	// If no tree data but has sequence data, show sequence
	if ((!tree || tree.nodes.length === 0) && seq)
	{
		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🔄</span> Splay 序列操作
				</h3>
				<div className="flex gap-1 flex-wrap justify-center">
					{seq.map((val, idx) =>
					{
						const i = idx + 1;
						const inRange = l !== undefined && r !== undefined && i >= l && i <= r;
						return (
							<div
								key={idx}
								className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded border-2 transition-all duration-300 ${
									inRange
										? 'bg-amber-500 border-amber-600 text-white'
										: 'bg-indigo-500/30 border-indigo-600 text-indigo-300'
								}`}
							>
								{val}
							</div>
						);
					})}
				</div>
				{l !== undefined && r !== undefined && (
					<div className="mt-3 text-xs text-gray-400 text-center">
						翻转区间 [{l}, {r}]
					</div>
				)}
				<div className="mt-2 text-[10px] text-gray-500 text-center">
					<span className="inline-block w-3 h-3 rounded bg-amber-500 mr-1"></span>翻转区间
					<span className="inline-block w-3 h-3 rounded bg-indigo-500/30 ml-3 mr-1"></span>其他元素
				</div>
			</div>
		);
	}

	if (!tree || tree.nodes.length === 0) return null;

	const { root, nodes } = tree;

	// Calculate tree depth for layout
	function getDepth(nodeId: number): number
	{
		if (!nodeId) return 0;
		const node = nodes.find(n => n.id === nodeId);
		if (!node) return 0;
		return 1 + Math.max(getDepth(node.ls), getDepth(node.rs));
	}

	const maxDepth = getDepth(root);
	const svgWidth = Math.max(600, Math.pow(2, maxDepth) * 60);
	const svgHeight = maxDepth * 80 + 50;

	// Calculate positions for each node
	function getNodePositions(
		nodeId: number,
		x: number,
		y: number,
		width: number,
		positions: Map<number, { x: number; y: number }>
	)
	{
		if (!nodeId) return;
		const node = nodes.find(n => n.id === nodeId);
		if (!node) return;

		positions.set(nodeId, { x, y });

		const childWidth = width / 2;
		if (node.ls)
		{
			getNodePositions(node.ls, x - childWidth / 2, y + 70, childWidth, positions);
		}
		if (node.rs)
		{
			getNodePositions(node.rs, x + childWidth / 2, y + 70, childWidth, positions);
		}
	}

	const positions = new Map<number, { x: number; y: number }>();
	getNodePositions(root, svgWidth / 2, 40, svgWidth * 0.8, positions);

	// Render edges
	function renderEdges(nodeId: number): React.ReactElement[]
	{
		if (!nodeId) return [];
		const node = nodes.find(n => n.id === nodeId);
		if (!node) return [];
		const parentPos = positions.get(nodeId);
		if (!parentPos) return [];

		const edges: React.ReactElement[] = [];

		if (node.ls)
		{
			const childPos = positions.get(node.ls);
			if (childPos)
			{
				edges.push(
					<line
						key={`edge-${nodeId}-ls`}
						x1={parentPos.x}
						y1={parentPos.y + 25}
						x2={childPos.x}
						y2={childPos.y - 25}
						stroke="#6b7280"
						strokeWidth={2}
					/>
				);
				edges.push(...renderEdges(node.ls));
			}
		}

		if (node.rs)
		{
			const childPos = positions.get(node.rs);
			if (childPos)
			{
				edges.push(
					<line
						key={`edge-${nodeId}-rs`}
						x1={parentPos.x}
						y1={parentPos.y + 25}
						x2={childPos.x}
						y2={childPos.y - 25}
						stroke="#6b7280"
						strokeWidth={2}
					/>
				);
				edges.push(...renderEdges(node.rs));
			}
		}

		return edges;
	}

	// Render nodes
	function renderNode(nodeId: number)
	{
		if (!nodeId) return null;
		const node = nodes.find(n => n.id === nodeId);
		if (!node) return null;
		const pos = positions.get(nodeId);
		if (!pos) return null;

		const isHL = highlight.has(String(nodeId));
		const fillColor = isHL ? '#f59e0b' : '#6366f1';
		const strokeColor = isHL ? '#d97706' : '#4f46e5';

		return (
			<g key={`node-${nodeId}`}>
				{/* 节点圆形 */}
				<circle
					cx={pos.x}
					cy={pos.y}
					r={25}
					fill={fillColor}
					stroke={strokeColor}
					strokeWidth={2}
				/>
				{/* 节点值 */}
				<text
					x={pos.x}
					y={pos.y + 5}
					textAnchor="middle"
					fontSize="14"
					fontWeight="bold"
					fill="white"
				>
					{node.val}
				</text>
				{/* 子树大小 */}
				{node.siz !== undefined && (
					<text
						x={pos.x}
						y={pos.y + 40}
						textAnchor="middle"
						fontSize="10"
						fill="#9ca3af"
					>
						siz={node.siz}
					</text>
				)}
			</g>
		);
	}

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌳</span> Splay 平衡树
			</h3>
			<div className="overflow-x-auto">
				<svg width={svgWidth} height={svgHeight} className="mx-auto">
					{/* 渲染边 */}
					{renderEdges(root)}
					{/* 渲染节点 */}
					{nodes.map(node => renderNode(node.id))}
				</svg>
			</div>
			<div className="mt-3 text-xs text-gray-400">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded-full bg-indigo-500"></div>
						<span>普通节点</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded-full bg-amber-500"></div>
						<span>当前操作节点</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplayVisualizer;
