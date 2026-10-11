import React from 'react';
import { SimStep } from '../types';

interface TarjanSCCVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

const TarjanSCCVisualizer: React.FC<TarjanSCCVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const firstLine = lines[0].split(/\s+/).map(Number);
	const n = firstLine[0];
	const m = firstLine[1];

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const dfn = vars.dfn as number[] | undefined;
	const low = vars.low as number[] | undefined;
	const stk = vars.stk as number[] | undefined;
	const scc_cnt = vars.scc_cnt as number | undefined;
	const scc = vars.scc as number[][] | undefined;

	// Parse edges
	const edges: { from: number; to: number }[] = [];
	for (let i = 1; i <= m && i < lines.length; ++i)
	{
		const parts = lines[i].split(/\s+/).map(Number);
		edges.push({ from: parts[0], to: parts[1] });
	}

	// Layout nodes in a circle
	const cx = 200, cy = 170;
	const radius = Math.min(130, 50 + n * 10);
	const nodes: { id: number; x: number; y: number }[] = [];
	for (let i = 1; i <= n; ++i)
	{
		const angle = (2 * Math.PI * (i - 1)) / n - Math.PI / 2;
		nodes.push({
			id: i,
			x: cx + radius * Math.cos(angle),
			y: cy + radius * Math.sin(angle),
		});
	}

	const nodeMap = new Map(nodes.map(n => [n.id, n]));

	// Color nodes by SCC if available
	const getNodeColor = (id: number) =>
	{
		if (highlight.has(String(id))) return { fill: '#f59e0b', stroke: '#d97706' };
		if (scc && scc_cnt)
		{
			// Find which SCC this node belongs to
			const colors = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#06b6d4'];
			for (let i = 0; i < scc.length; ++i)
			{
				if (scc[i].includes(id))
				{
					const colorIdx = i % colors.length;
					return { fill: colors[colorIdx], stroke: colors[colorIdx] };
				}
			}
		}
		if (dfn && dfn[id] > 0) return { fill: '#6366f1', stroke: '#4f46e5' };
		return { fill: '#374151', stroke: '#4b5563' };
	};

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> Tarjan 强连通分量
			</h3>
			<div className="flex justify-center">
				<svg viewBox="0 0 400 360" className="w-full max-w-[400px] h-auto">
					<defs>
						<marker id="tarjan-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
						</marker>
						<marker id="tarjan-arrow-hl" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
							<polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
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

						const x1 = fromNode.x + ux * 18;
						const y1 = fromNode.y + uy * 18;
						const x2 = toNode.x - ux * 18;
						const y2 = toNode.y - uy * 18;

						return (
							<line
								key={`edge-${idx}`}
								x1={x1} y1={y1} x2={x2} y2={y2}
								stroke={isHL ? '#f59e0b' : '#4b5563'}
								strokeWidth={isHL ? 2.5 : 1.5}
								markerEnd={isHL ? 'url(#tarjan-arrow-hl)' : 'url(#tarjan-arrow)'}
								className="transition-all duration-300"
							/>
						);
					})}

					{/* Nodes */}
					{nodes.map(node =>
					{
						const colors = getNodeColor(node.id);
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
								{dfn && dfn[node.id] > 0 && (
									<text
										x={node.x} y={node.y + 30}
										textAnchor="middle"
										fontSize="8"
										fill="#9ca3af"
										className="font-mono"
									>
										d:{dfn[node.id]} l:{low?.[node.id]}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			{stk && stk.length > 0 && (
				<div className="mt-2 text-xs text-gray-400">
					栈: [{stk.join(', ')}]
				</div>
			)}
			{scc_cnt !== undefined && (
				<div className="mt-1 text-xs text-gray-400">
					强连通分量数: {scc_cnt}
				</div>
			)}
		</div>
	);
};

export default TarjanSCCVisualizer;
