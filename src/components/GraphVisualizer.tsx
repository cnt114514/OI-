import React from 'react';
import { SimStep } from '../types';

interface GraphVisualizerProps
{
	step: SimStep | null;
	inputText: string;
	algoId: string;
}

interface GNode
{
	id: number;
	x: number;
	y: number;
}

interface GEdge
{
	from: number;
	to: number;
	w: number;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ step, inputText, algoId }) =>
{
	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const firstLine = lines[0].split(/\s+/).map(Number);
	const n = firstLine[0];
	const m = firstLine[1];

	// Parse edges
	const edges: GEdge[] = [];
	for (let i = 1; i <= m && i < lines.length; ++i)
	{
		const parts = lines[i].split(/\s+/).map(Number);
		const u = parts[0], v = parts[1], w = parts[2] ?? 1;
		edges.push({ from: u, to: v, w });
	}

	// Get highlight info from step
	const highlight = new Set(step?.highlight || []);
	const vars = step?.vars || {};
	
	// Get MST edges for Kruskal
	const mstEdges = vars.mstEdges as string[] | undefined;
	const mstEdgeSet = new Set<string>();
	if (mstEdges)
	{
		for (const e of mstEdges)
		{
			const parts = e.split('-');
			const u = parseInt(parts[0]);
			const v = parseInt(parts[1].split(':')[0]);
			mstEdgeSet.add(`${u}-${v}`);
			mstEdgeSet.add(`${v}-${u}`);
		}
	}

	// Layout nodes in a circle
	const cx = 200, cy = 170;
	const radius = Math.min(130, 50 + n * 10);
	const nodes: GNode[] = [];
	for (let i = 1; i <= n; ++i)
	{
		const angle = (2 * Math.PI * (i - 1)) / n - Math.PI / 2;
		nodes.push({
			id: i,
			x: cx + radius * Math.cos(angle),
			y: cy + radius * Math.sin(angle),
		});
	}

	const dis = vars.dis;
	const vis = vars.vis as boolean[] | undefined;

	const getDis = (id: number): number | null =>
	{
		if (!dis) return null;
		if (Array.isArray(dis)) return dis[id] ?? null;
		if (typeof dis === 'object') return (dis as Record<string, number>)[String(id)] ?? null;
		return null;
	};

	const getNodeColor = (id: number) =>
	{
		if (highlight.has(String(id))) return { fill: '#f59e0b', stroke: '#d97706' };
		if (vis && vis[id]) return { fill: '#10b981', stroke: '#059669' };
		const d = getDis(id);
		if (d !== null && d !== -1 && d < 1e15) return { fill: '#6366f1', stroke: '#4f46e5' };
		return { fill: '#374151', stroke: '#4b5563' };
	};

	const isEdgeHighlighted = (from: number, to: number): boolean =>
	{
		return highlight.has(String(from)) && highlight.has(String(to));
	};

	const isMSTEdge = (from: number, to: number): boolean =>
	{
		return mstEdgeSet.has(`${from}-${to}`);
	};

	const nodeMap = new Map(nodes.map(n => [n.id, n]));

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> 图结构可视化
			</h3>
			<div className="flex justify-center">
				<svg viewBox="0 0 400 360" className="w-full max-w-[400px] h-auto">
					<defs>
						<marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
						</marker>
						<marker id="arrow-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
						</marker>
					</defs>

					{/* Edges */}
					{edges.map((edge, idx) =>
					{
						const fromNode = nodeMap.get(edge.from);
						const toNode = nodeMap.get(edge.to);
						if (!fromNode || !toNode) return null;

						const hl = isEdgeHighlighted(edge.from, edge.to);
						const isMST = isMSTEdge(edge.from, edge.to);
						const dx = toNode.x - fromNode.x;
						const dy = toNode.y - fromNode.y;
						const len = Math.sqrt(dx * dx + dy * dy);
						if (len === 0) return null;
						const ux = dx / len;
						const uy = dy / len;

						const x1 = fromNode.x + ux * 18;
						const y1 = fromNode.y + uy * 18;
						const x2 = toNode.x - ux * 18;
						const y2 = toNode.y - uy * 18;

						const midX = (fromNode.x + toNode.x) / 2;
						const midY = (fromNode.y + toNode.y) / 2;

						let strokeColor = '#4b5563';
						let strokeWidth = 1.5;
						let fillColor = '#9ca3af';
						
						// 判断是否为有向图算法
						const isDirected = ['dijkstra', 'spfa', 'floyd', 'tarjanscc', 'ek', 'dinic', 'hlpp', 'mcmf', 'edmonds'].includes(algoId);
						let markerId = isDirected ? 'url(#arrow)' : undefined;

						if (hl)
						{
							strokeColor = '#f59e0b';
							strokeWidth = 2.5;
							fillColor = '#fbbf24';
							markerId = isDirected ? 'url(#arrow-hl)' : undefined;
						}
						else if (isMST)
						{
							strokeColor = '#10b981';
							strokeWidth = 3;
							fillColor = '#34d399';
						}

						return (
							<g key={`edge-${idx}`}>
								<line
									x1={x1} y1={y1} x2={x2} y2={y2}
									stroke={strokeColor}
									strokeWidth={strokeWidth}
									markerEnd={markerId}
									className="transition-all duration-300"
								/>
								<text
									x={midX + uy * 10}
									y={midY - ux * 10}
									textAnchor="middle"
									fontSize="10"
									fill={fillColor}
									className="font-mono"
								>
									{edge.w}
								</text>
							</g>
						);
					})}

					{/* Nodes */}
					{nodes.map(node =>
					{
						const colors = getNodeColor(node.id);
						const d = getDis(node.id);
						return (
							<g key={`node-${node.id}`} className="transition-all duration-300">
								{highlight.has(String(node.id)) && (
									<circle
										cx={node.x} cy={node.y} r={22}
										fill="none" stroke="#f59e0b" strokeWidth={2}
										opacity={0.5}
									/>
								)}
								<circle
									cx={node.x} cy={node.y} r={16}
									fill={colors.fill}
									stroke={colors.stroke}
									strokeWidth={2}
								/>
								<text
									x={node.x} y={node.y + 4}
									textAnchor="middle"
									fontSize="11"
									fontWeight="bold"
									fill="#fff"
								>
									{node.id}
								</text>
								{d !== null && d !== -1 && (
									<text
										x={node.x} y={node.y + 30}
										textAnchor="middle"
										fontSize="9"
										fill={d > 1e15 ? '#6b7280' : '#a5b4fc'}
										className="font-mono"
									>
										{d > 1e15 ? 'INF' : d}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
		</div>
	);
};

export default GraphVisualizer;
