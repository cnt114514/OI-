import React from 'react';
import { SimStep } from '../types';

interface NetworkFlowVisualizerProps
{
	step: SimStep | null;
	inputText: string;
	algoId: string;
}

interface NFNode
{
	id: number;
	x: number;
	y: number;
}

interface NFEdge
{
	from: number;
	to: number;
	cap: number;
	flow: number;
}

const NetworkFlowVisualizer: React.FC<NetworkFlowVisualizerProps> = ({ step, inputText, algoId }) =>
{
	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const firstLine = lines[0].split(/\s+/).map(Number);
	const n = firstLine[0];
	const m = firstLine[1];
	const s = firstLine[2];
	const t = firstLine[3];

	// Parse initial edges
	const initEdges: NFEdge[] = [];
	for (let i = 1; i <= m && i < lines.length; ++i)
	{
		const parts = lines[i].split(/\s+/).map(Number);
		initEdges.push({ from: parts[0], to: parts[1], cap: parts[2], flow: 0 });
	}

	const vars = step?.vars || {};
	const highlight = new Set(step?.highlight || []);
	const maxf = vars.maxf as number | undefined;
	const minw = vars.minw as number | undefined;
	const edgeStates = vars.edgeStates as { from: number; to: number; flow: number; cap: number }[] | undefined;

	// Merge current flow into edges
	const edges: NFEdge[] = initEdges.map(e =>
	{
		if (edgeStates)
		{
			const state = edgeStates.find(es => es.from === e.from && es.to === e.to);
			if (state) return { ...e, flow: state.flow, cap: state.cap };
		}
		return e;
	});

	// Layout nodes
	const allNodes = new Set<number>();
	allNodes.add(s);
	allNodes.add(t);
	for (const e of edges)
	{
		allNodes.add(e.from);
		allNodes.add(e.to);
	}

	const nodeIds = Array.from(allNodes).sort((a, b) => a - b);
	const cx = 200, cy = 160;
	const radius = Math.min(120, 40 + nodeIds.length * 10);

	const nodes: NFNode[] = nodeIds.map((id, idx) =>
	{
		const angle = (2 * Math.PI * idx) / nodeIds.length - Math.PI / 2;
		return {
			id,
			x: cx + radius * Math.cos(angle),
			y: cy + radius * Math.sin(angle),
		};
	});

	const nodeMap = new Map(nodes.map(n => [n.id, n]));

	const getNodeColor = (id: number) =>
	{
		if (id === s) return { fill: '#22c55e', stroke: '#16a34a' };
		if (id === t) return { fill: '#ef4444', stroke: '#dc2626' };
		if (highlight.has(String(id))) return { fill: '#f59e0b', stroke: '#d97706' };
		return { fill: '#6366f1', stroke: '#4f46e5' };
	};

	const getEdgeColor = (flow: number, cap: number) =>
	{
		if (cap === 0) return '#374151';
		const ratio = flow / cap;
		if (ratio >= 1) return '#ef4444';
		if (ratio > 0.5) return '#f59e0b';
		if (ratio > 0) return '#3b82f6';
		return '#4b5563';
	};

	const getEdgeWidth = (flow: number, cap: number, isHL: boolean) =>
	{
		if (isHL) return 3;
		if (cap === 0) return 1;
		const ratio = flow / cap;
		return 1 + ratio * 2;
	};

	const formatNumber = (num: number): string =>
	{
		if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
		if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
		if (num >= 1e4) return (num / 1e3).toFixed(1) + 'K';
		return String(num);
	};

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<div className="flex items-center justify-between mb-3">
				<h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
					<span>🌊</span> 网络流可视化
				</h3>
				<div className="text-xs font-mono">
					{maxf !== undefined && (
						<span className="text-amber-400 font-bold">maxf = {maxf}</span>
					)}
					{minw !== undefined && (
						<span className="ml-3 text-cyan-400 font-bold">minw = {minw}</span>
					)}
				</div>
			</div>
			<div className="flex justify-center">
				<svg viewBox="0 0 400 320" className="w-full max-w-[420px] h-auto">
					<defs>
						<marker id="nf-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#6b7280" />
						</marker>
						<marker id="nf-arrow-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#f59e0b" />
						</marker>
						<marker id="nf-arrow-red" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#ef4444" />
						</marker>
						<marker id="nf-arrow-blue" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#3b82f6" />
						</marker>
					</defs>

					{/* Edges */}
					{edges.map((edge, idx) =>
					{
						const fromNode = nodeMap.get(edge.from);
						const toNode = nodeMap.get(edge.to);
						if (!fromNode || !toNode) return null;

						const isHL = highlight.has(String(edge.from)) && highlight.has(String(edge.to));
						const dx = toNode.x - fromNode.x;
						const dy = toNode.y - fromNode.y;
						const len = Math.sqrt(dx * dx + dy * dy);
						if (len === 0) return null;
						const ux = dx / len;
						const uy = dy / len;

						const x1 = fromNode.x + ux * 20;
						const y1 = fromNode.y + uy * 20;
						const x2 = toNode.x - ux * 20;
						const y2 = toNode.y - uy * 20;

						const midX = (fromNode.x + toNode.x) / 2;
						const midY = (fromNode.y + toNode.y) / 2;

						const color = isHL ? '#f59e0b' : getEdgeColor(edge.flow, edge.cap);
						const width = getEdgeWidth(edge.flow, edge.cap, isHL);

						let markerId = 'url(#nf-arrow)';
						if (isHL) markerId = 'url(#nf-arrow-hl)';
						else if (edge.flow >= edge.cap && edge.cap > 0) markerId = 'url(#nf-arrow-red)';
						else if (edge.flow > 0) markerId = 'url(#nf-arrow-blue)';

						const label = `${formatNumber(edge.flow)}/${formatNumber(edge.cap)}`;
						const labelWidth = Math.max(32, Math.min(60, label.length * 5.5 + 6));

						return (
							<g key={`edge-${idx}`}>
								<line
									x1={x1} y1={y1} x2={x2} y2={y2}
									stroke={color}
									strokeWidth={width}
									markerEnd={markerId}
									className="transition-all duration-300"
								/>
								<rect
									x={midX + uy * 10 - labelWidth / 2} y={midY - ux * 10 - 7}
									width={labelWidth} height={14} rx={3}
									fill="#0f172a" stroke={color} strokeWidth={0.8} opacity={0.95}
								/>
								<text
									x={midX + uy * 10} y={midY - ux * 10 + 3}
									textAnchor="middle" fontSize="8"
									fill={color} fontWeight="bold"
									fontFamily="monospace"
								>
									{label}
								</text>
							</g>
						);
					})}

					{/* Nodes */}
					{nodes.map(node =>
					{
						const colors = getNodeColor(node.id);
						const isS = node.id === s;
						const isT = node.id === t;
						return (
							<g key={`node-${node.id}`} className="transition-all duration-300">
								{highlight.has(String(node.id)) && (
									<circle
										cx={node.x} cy={node.y} r={24}
										fill="none" stroke="#f59e0b" strokeWidth={2}
										opacity={0.4}
									/>
								)}
								<circle
									cx={node.x} cy={node.y} r={18}
									fill={colors.fill}
									stroke={colors.stroke}
									strokeWidth={2}
								/>
								<text
									x={node.x} y={node.y + 4}
									textAnchor="middle"
									fontSize="12"
									fontWeight="bold"
									fill="#fff"
								>
									{node.id}
								</text>
								{(isS || isT) && (
									<text
										x={node.x} y={node.y - 24}
										textAnchor="middle"
										fontSize="10"
										fill={isS ? '#4ade80' : '#f87171'}
										fontWeight="bold"
									>
										{isS ? 'S' : 'T'}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-gray-500">
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> 源点 S={s}
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> 汇点 T={t}
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-0.5 bg-gray-500 inline-block"></span> 空
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-0.5 bg-blue-500 inline-block"></span> 有流
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-0.5 bg-amber-500 inline-block"></span> 半满
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-0.5 bg-red-500 inline-block"></span> 满流
				</span>
			</div>
		</div>
	);
};

export default NetworkFlowVisualizer;
