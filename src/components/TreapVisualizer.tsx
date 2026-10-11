import React from 'react';
import { SimStep } from '../types';

interface TreapVisualizerProps
{
	step: SimStep | null;
	algoId: string;
}

interface TreeNode
{
	id: number;
	val: number;
	ls: number;
	rs: number;
	rev?: boolean;
	siz?: number;
}

interface TreeData
{
	root: number;
	nodes: TreeNode[];
	now: number;
	allRoots?: number[];
}

const TreapVisualizer: React.FC<TreapVisualizerProps> = ({ step, algoId }) =>
{
	if (!step) return null;

	const treeData = step.vars.tree as TreeData | undefined;
	
	// 如果没有树数据，显示提示信息
	if (!treeData || !treeData.nodes || treeData.nodes.length === 0) 
	{
		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🌳</span> {algoId === 'treap' ? 'Treap 平衡树' : 'FHQ Treap 文艺平衡树'}
				</h3>
				<div className="text-center text-gray-500 text-sm py-8">
					暂无树结构数据
				</div>
			</div>
		);
	}

	const { root, nodes, allRoots } = treeData;
	const roots = allRoots && allRoots.length > 0 ? allRoots : (root ? [root] : []);
	
	// 如果没有有效的根节点，也显示提示
	if (roots.length === 0)
	{
		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🌳</span> {algoId === 'treap' ? 'Treap 平衡树' : 'FHQ Treap 文艺平衡树'}
				</h3>
				<div className="text-center text-gray-500 text-sm py-8">
					树为空（节点数: {nodes.length}）
				</div>
			</div>
		);
	}

	// 计算树的高度和布局
	function getDepth(nodeId: number): number
	{
		if (!nodeId) return 0;
		const node = nodes.find(n => n.id === nodeId);
		if (!node) return 0;
		return 1 + Math.max(getDepth(node.ls), getDepth(node.rs));
	}

	const maxDepth = Math.max(...roots.map(r => getDepth(r)));
	const numTrees = roots.length;
	const treeWidth = 300;
	const svgWidth = Math.max(600, numTrees * treeWidth);
	const svgHeight = maxDepth * 80 + 50;

	// 递归计算节点位置
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
	
	// 为每棵树分配位置，过滤掉无效的根节点（0）
	const validRoots = roots.filter(r => r !== 0);
	validRoots.forEach((r, idx) =>
	{
		const offsetX = (idx + 0.5) * (svgWidth / Math.max(1, validRoots.length));
		getNodePositions(r, offsetX, 40, treeWidth * 0.8, positions);
	});

	// 获取搜索路径
	const searchPath = step?.highlight || [];
	const searchPathSet = new Set(searchPath);

	// 渲染节点
	function renderNode(nodeId: number)
	{
		if (!nodeId) return null;
		const node = nodes.find(n => n.id === nodeId);
		if (!node) return null;
		const pos = positions.get(nodeId);
		if (!pos) return null;

		const isRev = node.rev;
		const isInSearchPath = searchPathSet.has(String(nodeId));
		
		let fillColor = '#6366f1';
		let strokeColor = '#4f46e5';
		let strokeWidth = 2;

		if (isInSearchPath)
		{
			fillColor = '#f59e0b';
			strokeColor = '#d97706';
			strokeWidth = 3;
		}
		else if (isRev)
		{
			fillColor = '#f59e0b';
			strokeColor = '#d97706';
		}

		return (
			<g key={`node-${nodeId}`}>
				{/* 节点圆形 */}
				<circle
					cx={pos.x}
					cy={pos.y}
					r={25}
					fill={fillColor}
					stroke={strokeColor}
					strokeWidth={strokeWidth}
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
				{/* 翻转标记 */}
				{isRev && !isInSearchPath && (
					<text
						x={pos.x + 20}
						y={pos.y - 20}
						textAnchor="middle"
						fontSize="10"
						fill="#fbbf24"
						fontWeight="bold"
					>
						↻
					</text>
				)}
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

	// 渲染边
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

	// 自适应缩放
	const maxNodeCount = nodes.length;
	const scale = Math.min(1, 600 / svgWidth, 400 / svgHeight);
	const displayWidth = svgWidth * scale;
	const displayHeight = svgHeight * scale;

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🌳</span> {algoId === 'treap' ? 'Treap 平衡树' : 'FHQ Treap 文艺平衡树'}
				<span className="text-xs text-gray-500 ml-auto">
					节点数: {maxNodeCount}
					{validRoots.length > 1 && ` | ${validRoots.length} 棵树`}
				</span>
			</h3>
			<div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
				<svg 
					width={displayWidth} 
					height={displayHeight} 
					viewBox={`0 0 ${svgWidth} ${svgHeight}`}
					className="mx-auto"
					style={{ maxWidth: '100%', height: 'auto' }}
				>
					{/* 渲染所有树的边 */}
					{validRoots.map(r => renderEdges(r))}
					{/* 渲染所有节点 */}
					{nodes.map(node => renderNode(node.id))}
				</svg>
			</div>
			<div className="mt-3 text-xs text-gray-400">
				<div className="flex items-center gap-4 flex-wrap">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded-full bg-indigo-500"></div>
						<span>普通节点</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded-full bg-amber-500"></div>
						<span>带翻转标记</span>
					</div>
					{validRoots.length > 1 && (
						<div className="flex items-center gap-2">
							<span>树根: {validRoots.join(', ')}</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TreapVisualizer;
