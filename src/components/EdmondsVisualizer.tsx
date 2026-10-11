import React from 'react';
import { SimStep } from '../types';

interface EdmondsVisualizerProps
{
	step: SimStep | null;
}

interface GraphNode
{
	id: number;
	x: number;
	y: number;
}

interface GraphEdge
{
	from: number;
	to: number;
	weight: number;
}

const EdmondsVisualizer: React.FC<EdmondsVisualizerProps> = ({ step }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const graph = vars.graph as { nodes: { id: number }[]; edges: GraphEdge[] } | undefined;
	const mn = vars.mn as number[] | undefined;
	const pre = vars.pre as number[] | undefined;
	const id = vars.id as number[] | undefined;
	const cir_cnt = vars.cir_cnt as number | undefined;
	const res = vars.res as number | undefined;
	const iter = vars.iter as number | undefined;

	if (!graph || graph.nodes.length === 0) return null;

	// 布局节点（圆形布局）
	const cx = 250;
	const cy = 200;
	const radius = 150;
	const nodePositions = new Map<number, { x: number; y: number }>();

	graph.nodes.forEach((node, idx) =>
	{
		const angle = (2 * Math.PI * idx) / graph.nodes.length - Math.PI / 2;
		nodePositions.set(node.id, {
			x: cx + radius * Math.cos(angle),
			y: cy + radius * Math.sin(angle),
		});
	});

	// 确定最小入边
	const minInEdges = new Set<string>();
	if (mn && pre)
	{
		for (let i = 1; i < mn.length; ++i)
		{
			if (mn[i] !== 0 && mn[i] !== Infinity && pre[i] !== 0)
			{
				minInEdges.add(`${pre[i]}-${i}`);
			}
		}
	}

	// 确定环中的节点
	const cycleNodes = new Set<number>();
	if (id && cir_cnt && cir_cnt > 0)
	{
		const cycleId = id.filter(x => x > 0);
		const idCount = new Map<number, number>();
		for (const cid of cycleId)
		{
			idCount.set(cid, (idCount.get(cid) || 0) + 1);
		}
		// 找到有多个节点的环
		for (const [cid, count] of idCount)
		{
			if (count > 1)
			{
				for (let i = 0; i < id.length; ++i)
				{
					if (id[i] === cid) cycleNodes.add(i);
				}
			}
		}
	}

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
					<span>🌳</span> 朱刘算法可视化
				</h3>
				{res !== undefined && (
					<div className="text-xs font-mono">
						<span className="text-gray-500">总权值 = </span>
						<span className="text-amber-400 font-bold">{res}</span>
					</div>
				)}
			</div>

			<div className="flex justify-center">
				<svg viewBox="0 0 500 400" className="w-full max-w-[500px] h-auto">
					<defs>
						<marker id="edmonds-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
						</marker>
						<marker id="edmonds-arrow-min" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#10b981" />
						</marker>
					</defs>

					{/* 边 */}
					{graph.edges.map((edge, idx) =>
					{
						const fromPos = nodePositions.get(edge.from);
						const toPos = nodePositions.get(edge.to);
						if (!fromPos || !toPos) return null;

						const isMinEdge = minInEdges.has(`${edge.from}-${edge.to}`);
						const dx = toPos.x - fromPos.x;
						const dy = toPos.y - fromPos.y;
						const len = Math.sqrt(dx * dx + dy * dy);
						const ux = dx / len;
						const uy = dy / len;

						const x1 = fromPos.x + ux * 20;
						const y1 = fromPos.y + uy * 20;
						const x2 = toPos.x - ux * 20;
						const y2 = toPos.y - uy * 20;

						const midX = (fromPos.x + toPos.x) / 2;
						const midY = (fromPos.y + toPos.y) / 2;

						return (
							<g key={`edge-${idx}`}>
								<line
									x1={x1} y1={y1} x2={x2} y2={y2}
									stroke={isMinEdge ? '#10b981' : '#4b5563'}
									strokeWidth={isMinEdge ? 2.5 : 1.5}
									markerEnd={isMinEdge ? 'url(#edmonds-arrow-min)' : 'url(#edmonds-arrow)'}
									className="transition-all duration-300"
								/>
								<text
									x={midX + uy * 10}
									y={midY - ux * 10}
									textAnchor="middle"
									fontSize="10"
									fill={isMinEdge ? '#34d399' : '#9ca3af'}
									className="font-mono"
								>
									{edge.weight}
								</text>
							</g>
						);
					})}

					{/* 节点 */}
					{graph.nodes.map(node =>
					{
						const pos = nodePositions.get(node.id);
						if (!pos) return null;

						const isInCycle = cycleNodes.has(node.id);
						const fill = isInCycle ? '#f59e0b' : '#6366f1';
						const stroke = isInCycle ? '#d97706' : '#4f46e5';

						return (
							<g key={`node-${node.id}`} className="transition-all duration-300">
								{isInCycle && (
									<circle
										cx={pos.x} cy={pos.y} r={24}
										fill="none" stroke="#f59e0b" strokeWidth={2}
										opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={18}
									fill={fill}
									stroke={stroke}
									strokeWidth={2}
								/>
								<text
									x={pos.x} y={pos.y + 4}
									textAnchor="middle"
									fontSize="12"
									fontWeight="bold"
									fill="#fff"
								>
									{node.id}
								</text>
							</g>
						);
					})}
				</svg>
			</div>

			{/* 状态信息 */}
			<div className="mt-3 space-y-1 text-xs text-gray-400">
				{iter !== undefined && (
					<div>当前轮次: <span className="text-blue-400">{iter}</span></div>
				)}
				{cir_cnt !== undefined && (
					<div>发现环数: <span className="text-amber-400">{cir_cnt}</span></div>
				)}
				{mn && (
					<div className="flex flex-wrap gap-2">
						<span>最小入边:</span>
						{mn.map((w, i) => i > 0 && w !== 0 && w !== Infinity && (
							<span key={i} className="text-green-400 font-mono">
								{i}:{w}
							</span>
						))}
					</div>
				)}
			</div>

			{/* 图例 */}
			<div className="mt-3 text-[10px] text-gray-500 flex flex-wrap justify-center gap-3">
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span> 普通节点
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 环中节点
				</span>
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-green-500 inline-block"></span> 最小入边
				</span>
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-gray-500 inline-block"></span> 普通边
				</span>
			</div>
		</div>
	);
};

export default EdmondsVisualizer;
