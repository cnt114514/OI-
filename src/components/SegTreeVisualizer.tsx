import React from 'react';
import { SimStep } from '../types';

interface SegTreeVisualizerProps
{
	step: SimStep | null;
}

const SegTreeVisualizer: React.FC<SegTreeVisualizerProps> = ({ step }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const sum = vars.sum as number[] | undefined;
	const lazy = vars.lazy as number[] | undefined;
	const n = vars.n as number | undefined;

	if (!sum || !n) return null;

	// 线段树的树形布局
	// 节点 p 的左孩子是 2p，右孩子是 2p+1
	const positions: Map<number, { x: number; y: number }> = new Map();
	const nodeRadius = 20;

	// 计算树的高度
	const height = Math.ceil(Math.log2(n)) + 1;

	// 递归布局
	function layoutTree(node: number, l: number, r: number, depth: number, left: number, right: number)
	{
		if (!sum || node >= sum.length || l > r) return;

		const x = (left + right) / 2;
		const y = 40 + depth * 60;
		positions.set(node, { x, y });

		if (l === r) return;

		const mid = (l + r) >> 1;
		const halfWidth = (right - left) / 2;

		// 左子树
		layoutTree(node << 1, l, mid, depth + 1, left, left + halfWidth);
		// 右子树
		layoutTree(node << 1 | 1, mid + 1, r, depth + 1, left + halfWidth, right);
	}

	layoutTree(1, 1, n, 0, 20, 380);

	const svgHeight = Math.max(300, (positions.size > 0 ? Math.max(...Array.from(positions.values()).map(p => p.y)) + 80 : 300));

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌲</span> 线段树结构
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					{/* 边 */}
					{Array.from(positions.keys()).map(node =>
					{
						if (node >= sum.length) return null;
						const leftChild = node << 1;
						const rightChild = node << 1 | 1;

						const parentPos = positions.get(node);
						if (!parentPos) return null;

						const edges: React.ReactElement[] = [];

						if (positions.has(leftChild))
						{
							const childPos = positions.get(leftChild);
							if (childPos)
							{
								edges.push(
									<line
										key={`edge-${node}-l`}
										x1={parentPos.x} y1={parentPos.y + nodeRadius}
										x2={childPos.x} y2={childPos.y - nodeRadius}
										stroke="#4b5563"
										strokeWidth={1.5}
									/>
								);
							}
						}

						if (positions.has(rightChild))
						{
							const childPos = positions.get(rightChild);
							if (childPos)
							{
								edges.push(
									<line
										key={`edge-${node}-r`}
										x1={parentPos.x} y1={parentPos.y + nodeRadius}
										x2={childPos.x} y2={childPos.y - nodeRadius}
										stroke="#4b5563"
										strokeWidth={1.5}
									/>
								);
							}
						}

						return edges;
					})}

					{/* 节点 */}
					{Array.from(positions.entries()).map(([node, pos]) =>
					{
						if (!sum || node >= sum.length) return null;

						const hasLazy = lazy && lazy[node] !== 0;

						return (
							<g key={`node-${node}`}>
								<rect
									x={pos.x - 24} y={pos.y - 16}
									width={48} height={32}
									rx={4}
									fill={hasLazy ? '#7c3aed' : '#374151'}
									stroke={hasLazy ? '#8b5cf6' : '#4b5563'}
									strokeWidth={2}
									className="transition-all duration-300"
								/>
								<text
									x={pos.x} y={pos.y - 4}
									textAnchor="middle"
									fontSize="8"
									fill="#d1d5db"
								>
									{node}
								</text>
								<text
									x={pos.x} y={pos.y + 9}
									textAnchor="middle"
									fontSize="11"
									fontWeight="bold"
									fill="#fff"
								>
									{sum[node]}
								</text>
								{hasLazy && (
									<text
										x={pos.x + 28} y={pos.y - 8}
										textAnchor="start"
										fontSize="8"
										fill="#c4b5fd"
									>
										lz:{lazy[node]}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center">
				紫色节点表示有 lazy 标记未下传
			</div>
		</div>
	);
};

export default SegTreeVisualizer;
