import React, { useMemo } from 'react';
import { SimStep } from '../types';

interface ACVisualizerProps
{
	step: SimStep | null;
	inputText: string;
}

interface ACNode
{
	id: number;
	children: { char: string; to: number }[];
	fail: number;
	cnt: number;
	depth: number;
}

const ACVisualizer: React.FC<ACVisualizerProps> = ({ step, inputText }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const highlight = new Set(step.highlight || []);
	const nodes = vars.acNodes as ACNode[] | undefined;

	if (!nodes || nodes.length === 0) return null;

	const positions = useMemo(() =>
	{
		const pos = new Map<number, { x: number; y: number }>();

		// 按深度分层
		const levels: number[][] = [];
		for (const node of nodes)
		{
			while (levels.length <= node.depth) levels.push([]);
			levels[node.depth].push(node.id);
		}

		const nodeRadius = 24;
		const levelHeight = 100;  // 增大层间距
		const nodeSpacing = 80;   // 增大节点间距

		levels.forEach((level, idx) =>
		{
			const y = 60 + idx * levelHeight;
			const totalWidth = (level.length - 1) * nodeSpacing;
			const startX = 300 - totalWidth / 2;  // 中心点右移
			level.forEach((nodeId, i) =>
			{
				pos.set(nodeId, { x: startX + i * nodeSpacing, y });
			});
		});

		return pos;
	}, [nodes.map(n => `${n.id}:${n.depth}`).join(',')]);

	const svgHeight = useMemo(() =>
	{
		const maxDepth = Math.max(...nodes.map(n => n.depth));
		return Math.max(400, (maxDepth + 1) * 100 + 100);  // 增大高度
	}, [nodes]);

	const nodeRadius = 24;

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>🔗</span> AC 自动机 (Trie + Fail 指针)
				<span className="text-xs text-gray-500 ml-auto">节点数: {nodes.length}</span>
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<svg viewBox={`0 0 600 ${svgHeight}`} className="w-full max-w-[900px] h-auto">
					<defs>
						<marker id="ac-child" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#6b7280" />
						</marker>
						<marker id="ac-child-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#f59e0b" />
						</marker>
						<marker id="ac-fail" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#ef4444" />
						</marker>
						<marker id="ac-fail-hl" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
							<polygon points="0 0, 7 2.5, 0 5" fill="#fbbf24" />
						</marker>
					</defs>

					{/* Trie 边 */}
					{nodes.map(node =>
					{
						const fromPos = positions.get(node.id);
						if (!fromPos) return null;
						return node.children.map((child, idx) =>
						{
							const toPos = positions.get(child.to);
							if (!toPos) return null;

							const isHL = highlight.has(String(node.id)) && highlight.has(String(child.to));

							return (
								<g key={`child-${node.id}-${idx}`}>
									<line
										x1={fromPos.x} y1={fromPos.y + nodeRadius}
										x2={toPos.x} y2={toPos.y - nodeRadius}
										stroke={isHL ? '#f59e0b' : '#6b7280'}
										strokeWidth={isHL ? 2.5 : 1.5}
										markerEnd={isHL ? 'url(#ac-child-hl)' : 'url(#ac-child)'}
									/>
									<text
										x={(fromPos.x + toPos.x) / 2 + 8}
										y={(fromPos.y + toPos.y) / 2}
										fontSize="11" fontWeight="bold"
										fill={isHL ? '#fbbf24' : '#9ca3af'}
									>
										{child.char}
									</text>
								</g>
							);
						});
					})}

					{/* Fail 指针 (曲线虚线) - 显示所有，但用不同样式区分 */}
					{nodes.map(node =>
					{
						if (node.fail === 0 || node.id === 0) return null;
						const fromPos = positions.get(node.id);
						const toPos = positions.get(node.fail);
						if (!fromPos || !toPos) return null;

						const isHL = highlight.has(String(node.id)) && highlight.has(String(node.fail));

						// 计算控制点，创建更平缓的曲线
						const midX = (fromPos.x + toPos.x) / 2;
						const midY = (fromPos.y + toPos.y) / 2;
						const dx = toPos.x - fromPos.x;
						const dy = toPos.y - fromPos.y;
						// 控制点偏移，使曲线更平缓
						const controlX = midX - dy * 0.2;
						const controlY = midY + dx * 0.2;

						// 高亮的用粗线亮色，普通的用细线淡色
						const strokeColor = isHL ? '#fbbf24' : '#ef4444';
						const strokeWidth = isHL ? 2.5 : 1;
						const opacity = isHL ? 1 : 0.4;
						const markerId = isHL ? 'url(#ac-fail-hl)' : 'url(#ac-fail)';

						return (
							<g key={`fail-${node.id}`} opacity={opacity}>
								<path
									d={`M ${fromPos.x} ${fromPos.y - nodeRadius} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y - nodeRadius}`}
									fill="none"
									stroke={strokeColor}
									strokeWidth={strokeWidth}
									strokeDasharray="4,3"
									markerEnd={markerId}
								/>
							</g>
						);
					})}

					{/* 节点 */}
					{nodes.map(node =>
					{
						const pos = positions.get(node.id);
						if (!pos) return null;

						const isHL = highlight.has(String(node.id));
						const isRoot = node.id === 0;
						const fill = isHL ? '#f59e0b' : isRoot ? '#22c55e' : '#6366f1';
						const stroke = isHL ? '#d97706' : isRoot ? '#16a34a' : '#4f46e5';

						return (
							<g key={`node-${node.id}`}>
								{isHL && (
									<circle
										cx={pos.x} cy={pos.y} r={nodeRadius + 4}
										fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5}
									/>
								)}
								<circle
									cx={pos.x} cy={pos.y} r={nodeRadius}
									fill={fill} stroke={stroke} strokeWidth={2}
								/>
								<text
									x={pos.x} y={pos.y - 3}
									textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff"
								>
									{node.id}
								</text>
								{node.cnt > 0 && (
									<text
										x={pos.x} y={pos.y + 11}
										textAnchor="middle" fontSize="9" fill="#d1d5db"
									>
										cnt:{node.cnt}
									</text>
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="mt-2 text-[10px] text-gray-500 text-center flex flex-wrap justify-center gap-3">
				<span className="flex items-center gap-1">
					<span className="w-4 h-0.5 bg-gray-500 inline-block"></span> Trie 边
				</span>
				<span className="flex items-center gap-1">
					<svg width="20" height="10" className="inline-block">
						<path d="M 2 8 Q 10 2 18 8" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.4" />
					</svg>
					Fail 指针
				</span>
				<span className="flex items-center gap-1">
					<svg width="20" height="10" className="inline-block">
						<path d="M 2 8 Q 10 2 18 8" stroke="#fbbf24" strokeWidth="2" strokeDasharray="2,2" fill="none" />
					</svg>
					当前 Fail 指针
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

export default ACVisualizer;
