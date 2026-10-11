import React, { useMemo } from 'react';
import { SimStep } from '../types';

interface GSAMVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

interface GSAMNode
{
	id: number;
	len: number;
	fa: number;
	trans: { char: string; to: number }[];
}

const GSAMVisualizer: React.FC<GSAMVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const lines = inputText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
	if (lines.length < 1) return null;

	const n = Number(lines[0]);
	const strings = lines.slice(1, n + 1);

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const nodes = vars.gsamNodes as GSAMNode[] | undefined;

	// 即使节点为空也显示基本信息
	if (!nodes || nodes.length === 0)
	{
		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
					<span>🔗</span> 广义后缀自动机 (GSAM)
				</h3>
				<div className="mb-2 text-xs text-gray-400">
					输入字符串: {strings.map((s, i) => (
						<span key={i} className="text-cyan-400 font-mono">"{s}"{i < strings.length - 1 ? ', ' : ''}</span>
					))}
				</div>
				<div className="text-center text-gray-500 text-sm py-8">
					正在构建 GSAM...
				</div>
			</div>
		);
	}

	const positions = useMemo(() =>
	{
		const pos = new Map<number, { x: number; y: number }>();

		const levels: number[][] = [];
		for (const node of nodes)
		{
			while (levels.length <= node.len) levels.push([]);
			levels[node.len].push(node.id);
		}

		const nodeRadius = 28;
		const maxLevels = levels.length;
		
		// 动态调整层高度，避免过长
		let levelHeight = 90;
		let nodeSpacing = 70;
		
		if (maxLevels > 8)
		{
			levelHeight = Math.max(50, 600 / maxLevels);
			nodeSpacing = Math.max(50, 60);
		}
		else if (maxLevels > 5)
		{
			levelHeight = Math.max(60, 500 / maxLevels);
		}

		levels.forEach((level, idx) =>
		{
			const y = 50 + idx * levelHeight;
			const totalWidth = (level.length - 1) * nodeSpacing;
			const startX = 250 - totalWidth / 2;
			level.forEach((nodeId, i) =>
			{
				pos.set(nodeId, { x: startX + i * nodeSpacing, y });
			});
		});

		return pos;
	}, [JSON.stringify(nodes)]);

	const svgHeight = useMemo(() =>
	{
		const maxLen = Math.max(...nodes.map(n => n.len));
		const maxLevels = maxLen + 1;
		
		// 动态计算高度
		let levelHeight = 90;
		if (maxLevels > 8)
		{
			levelHeight = Math.max(50, 600 / maxLevels);
		}
		else if (maxLevels > 5)
		{
			levelHeight = Math.max(60, 500 / maxLevels);
		}
		
		return Math.max(300, maxLevels * levelHeight + 80);
	}, [nodes]);

	const nodeRadius = 28;

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> 广义后缀自动机 (GSAM)
				<span className="text-xs text-gray-500 ml-auto">节点数: {nodes.length}</span>
			</h3>
			<div className="mb-2 text-xs text-gray-400">
				输入字符串: {strings.map((s, i) => (
					<span key={i} className="text-cyan-400 font-mono">"{s}"{i < strings.length - 1 ? ', ' : ''}</span>
				))}
			</div>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 500 ${svgHeight}`} className="w-full max-w-[700px] h-auto">
					<defs>
						<marker id="gsam-link" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#ef4444" />
						</marker>
						<marker id="gsam-link-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#fbbf24" />
						</marker>
						<marker id="gsam-trans" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#8b5cf6" />
						</marker>
						<marker id="gsam-trans-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#fbbf24" />
						</marker>
					</defs>

					{/* 转移边 */}
					{nodes.map(node =>
					{
						const fromPos = positions.get(node.id);
						if (!fromPos) return null;
						return node.trans.map((t, idx) =>
						{
							const toPos = positions.get(t.to);
							if (!toPos) return null;

							const isHL = highlight.has(String(node.id)) && highlight.has(String(t.to));

							const dx = toPos.x - fromPos.x;
							const dy = toPos.y - fromPos.y;
							const len = Math.sqrt(dx * dx + dy * dy);
							if (len === 0) return null;
							const nx = -dy / len * 8;
							const ny = dx / len * 8;

							return (
								<g key={`trans-${node.id}-${idx}`}>
									<line
										x1={fromPos.x + nx} y1={fromPos.y + ny}
										x2={toPos.x + nx} y2={toPos.y + ny}
										stroke={isHL ? '#fbbf24' : '#8b5cf6'}
										strokeWidth={isHL ? 2.5 : 1.5}
										markerEnd={isHL ? 'url(#gsam-trans-hl)' : 'url(#gsam-trans)'}
									/>
									<text
										x={(fromPos.x + toPos.x) / 2 + nx * 1.5}
										y={(fromPos.y + toPos.y) / 2 + ny * 1.5}
										textAnchor="middle" fontSize="10" fontWeight="bold"
										fill={isHL ? '#fbbf24' : '#a78bfa'}
									>
										{t.char}
									</text>
								</g>
							);
						});
					})}

					{/* 后缀链接 (曲线虚线) */}
					{nodes.map(node =>
					{
						if (node.fa === 0 || node.id === 1) return null;
						const fromPos = positions.get(node.id);
						const toPos = positions.get(node.fa);
						if (!fromPos || !toPos) return null;

						const isHL = highlight.has(String(node.id)) && highlight.has(String(node.fa));

						// 计算控制点，创建曲线
						const midX = (fromPos.x + toPos.x) / 2;
						const midY = (fromPos.y + toPos.y) / 2;
						const dx = toPos.x - fromPos.x;
						const dy = toPos.y - fromPos.y;
						// 控制点偏移，使曲线向左弯曲
						const controlX = midX - dy * 0.3;
						const controlY = midY + dx * 0.3;

						return (
							<path
								key={`link-${node.id}`}
								d={`M ${fromPos.x} ${fromPos.y + nodeRadius} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y - nodeRadius}`}
								fill="none"
								stroke={isHL ? '#fbbf24' : '#ef4444'}
								strokeWidth={isHL ? 2 : 1}
								strokeDasharray="4,3"
								markerEnd={isHL ? 'url(#gsam-link-hl)' : 'url(#gsam-link)'}
							/>
						);
					})}

					{/* 节点 */}
					{nodes.map(node =>
					{
						const pos = positions.get(node.id);
						if (!pos) return null;

						const isHL = highlight.has(String(node.id));
						const isRoot = node.id === 1;
						const fill = isHL ? '#f59e0b' : isRoot ? '#22c55e' : '#8b5cf6';
						const stroke = isHL ? '#d97706' : isRoot ? '#16a34a' : '#7c3aed';

						return (
							<g key={`node-${node.id}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 5}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill} stroke={stroke} strokeWidth={2}
								/>
								<text
									x={pos.x} y={pos.y - 5}
									textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff"
								>
									{node.id}
								</text>
								<text
									x={pos.x} y={pos.y + 9}
									textAnchor="middle" fontSize="8" fill="#d1d5db"
								>
									len:{node.len}
								</text>
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center flex flex-wrap justify-center gap-3">
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-purple-500 inline-block"></span> 转移边
				</span>
				<span className="flex items-center gap-1">
					<svg width="20" height="10" className="inline-block">
						<path d="M 2 8 Q 10 2 18 8" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" fill="none" />
					</svg>
					后缀链接
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> 根节点
				</span>
				<span className="flex items-center gap-1">
					<span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 当前操作
				</span>
			</div>
		</div>
	);
};

export default GSAMVisualizer;
