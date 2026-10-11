import React from 'react';
import { SimStep } from '../types';

interface BITVisualizerProps
{
	step: SimStep | null;
}

const BITVisualizer: React.FC<BITVisualizerProps> = ({ step }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const tree = vars.tree as number[] | undefined;
	const n = vars.n as number | undefined;

	if (!tree || !n) return null;

	// 计算树形布局
	// BIT 的树形结构：节点 i 的父节点是 i + lowbit(i)
	// 根节点是那些 i + lowbit(i) > n 的节点
	const positions: Map<number, { x: number; y: number }> = new Map();
	const nodeRadius = 18;

	// 找到所有根节点
	const roots: number[] = [];
	for (let i = 1; i <= n; ++i)
	{
		const lowbit = i & (-i);
		if (i + lowbit > n)
		{
			roots.push(i);
		}
	}

	// 递归布局
	function layoutTree(node: number, x: number, y: number, width: number)
	{
		positions.set(node, { x, y });

		// 找到所有子节点
		const children: number[] = [];
		for (let i = 1; i < node; ++i)
		{
			const lowbit = i & (-i);
			if (i + lowbit === node)
			{
				children.push(i);
			}
		}

		if (children.length === 0) return;

		const childWidth = width / children.length;
		children.forEach((child, idx) =>
		{
			const childX = x - width / 2 + childWidth * (idx + 0.5);
			const childY = y + 60;
			layoutTree(child, childX, childY, childWidth * 0.8);
		});
	}

	// 布局所有根节点
	const rootWidth = 380 / roots.length;
	roots.forEach((root, idx) =>
	{
		const rootX = 20 + rootWidth * (idx + 0.5);
		layoutTree(root, rootX, 40, rootWidth * 0.8);
	});

	const svgHeight = Math.max(300, (positions.size > 0 ? Math.max(...Array.from(positions.values()).map(p => p.y)) + 80 : 300));

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌳</span> 树状数组结构
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 400 ${svgHeight}`} className="w-full max-w-[500px] h-auto">
					{/* 边 */}
					{Array.from({ length: n + 1 }, (_, i) => i).slice(1).map(i =>
					{
						const lowbit = i & (-i);
						const parent = i + lowbit;
						if (parent > n) return null;

						const parentPos = positions.get(parent);
						const childPos = positions.get(i);
						if (!parentPos || !childPos) return null;

						return (
							<line
								key={`edge-${i}`}
								x1={parentPos.x} y1={parentPos.y + nodeRadius}
								x2={childPos.x} y2={childPos.y - nodeRadius}
								stroke="#4b5563"
								strokeWidth={1.5}
							/>
						);
					})}

					{/* 节点 */}
					{Array.from({ length: n + 1 }, (_, i) => i).slice(1).map(i =>
					{
						const pos = positions.get(i);
						if (!pos) return null;

						const lowbit = i & (-i);
						const rangeStart = i - lowbit + 1;

						return (
							<g key={`node-${i}`}>
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill="#6366f1"
									stroke="#4f46e5"
									strokeWidth={2}
									className="transition-all duration-300"
								/>
								<text
									x={pos.x} y={pos.y - 3}
									textAnchor="middle"
									fontSize="10"
									fill="#d1d5db"
								>
									[{rangeStart},{i}]
								</text>
								<text
									x={pos.x} y={pos.y + 10}
									textAnchor="middle"
									fontSize="12"
									fontWeight="bold"
									fill="#fff"
								>
									{tree[i]}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center">
				每个节点存储区间 [i-lowbit(i)+1, i] 的和，父节点 = i + lowbit(i)
			</div>
		</div>
	);
};

export default BITVisualizer;
