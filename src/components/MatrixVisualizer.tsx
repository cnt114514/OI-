import React from 'react';
import { SimStep } from '../types';

interface MatrixVisualizerProps
{
	step: SimStep | null;
}

const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({ step }) =>
{
	if (!step) return null;

	const vars = step.vars || {};
	const a = vars.a as number[][] | undefined;
	const k = vars.k as number | undefined;
	const i = vars.i as number | undefined;
	const id = vars.id as number | undefined;
	const m = vars.m as number | undefined;

	if (!a || a.length === 0) return null;

	const n = a.length - 1; // a[0] 是空的，从 a[1] 开始
	const cols = a[1] ? a[1].length : 0;

	// 确定要高亮的行和列
	const highlightRows = new Set<number>();
	const highlightCols = new Set<number>();
	const swapRow1 = k;
	const swapRow2 = id;
	const eliminateRow = i;

	if (k !== undefined) highlightCols.add(k);
	if (swapRow1 !== undefined) highlightRows.add(swapRow1);
	if (swapRow2 !== undefined) highlightRows.add(swapRow2);
	if (eliminateRow !== undefined) highlightRows.add(eliminateRow);

	const cellSize = 60;
	const fontSize = 14;

	// 格式化数字，处理大数和科学计数法
	const formatNumber = (num: number): string =>
	{
		if (Math.abs(num) < 1e-9) return '0';
		if (Math.abs(num) >= 1e6) return num.toExponential(2);
		if (Math.abs(num) >= 1000) return num.toFixed(0);
		return num.toFixed(2);
	};

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>📊</span> 增广矩阵
			</h3>
			<div className="flex justify-center overflow-x-auto">
				<div className="inline-block">
					{/* 矩阵括号 */}
					<div className="flex items-center">
						<div className="text-4xl text-gray-500 font-thin mr-2">[</div>
						<div>
							{/* 列标题 */}
							<div className="flex mb-1">
								{Array.from({ length: cols - 1 }, (_, idx) => (
									<div
										key={`col-${idx}`}
										className={`flex items-center justify-center text-xs font-mono ${
											highlightCols.has(idx + 1) ? 'text-amber-400' : 'text-gray-500'
										}`}
										style={{ width: `${cellSize}px`, height: '20px' }}
									>
										x{idx + 1}
									</div>
								))}
								<div
									className="flex items-center justify-center text-xs font-mono text-cyan-400"
									style={{ width: `${cellSize}px`, height: '20px' }}
								>
									b
								</div>
							</div>

							{/* 矩阵内容 */}
							{a.slice(1, n + 1).map((row, rowIdx) =>
							{
								const rowNum = rowIdx + 1;
								const isHighlighted = highlightRows.has(rowNum);
								const isSwapRow = rowNum === swapRow1 || rowNum === swapRow2;
								const isEliminateRow = rowNum === eliminateRow;

								return (
									<div key={`row-${rowNum}`} className="flex items-center">
										{/* 行号 */}
										<div
											className={`text-xs font-mono mr-2 ${
												isHighlighted ? 'text-amber-400' : 'text-gray-500'
											}`}
											style={{ width: '20px', textAlign: 'right' }}
										>
											{rowNum}
										</div>

										{/* 矩阵元素 */}
										{row.slice(1).map((val, colIdx) =>
										{
											const colNum = colIdx + 1;
											const isLastCol = colNum === cols - 1;
											const isHighlightedCol = highlightCols.has(colNum);
											const isPivot = k !== undefined && rowNum === k && colNum === k;

											let bgColor = 'bg-gray-800';
											let borderColor = 'border-gray-600';
											let textColor = 'text-gray-300';

											if (isPivot)
											{
												bgColor = 'bg-amber-500';
												borderColor = 'border-amber-600';
												textColor = 'text-white font-bold';
											}
											else if (isSwapRow && isHighlightedCol)
											{
												bgColor = 'bg-emerald-500/30';
												borderColor = 'border-emerald-600';
												textColor = 'text-emerald-300';
											}
											else if (isEliminateRow && isHighlightedCol)
											{
												bgColor = 'bg-cyan-500/30';
												borderColor = 'border-cyan-600';
												textColor = 'text-cyan-300';
											}
											else if (isHighlighted)
											{
												bgColor = 'bg-gray-700';
												borderColor = 'border-gray-500';
											}

											if (isLastCol && !isPivot)
											{
												borderColor = 'border-l-2 border-cyan-600';
											}

											return (
												<div
													key={`cell-${rowNum}-${colNum}`}
													className={`flex items-center justify-center border transition-all duration-300 ${bgColor} ${borderColor} ${textColor}`}
													style={{
														width: `${cellSize}px`,
														height: `${cellSize}px`,
														fontSize: `${fontSize}px`,
													}}
												>
													{formatNumber(val)}
												</div>
											);
										})}
									</div>
								);
							})}
						</div>
						<div className="text-4xl text-gray-500 font-thin ml-2">]</div>
					</div>
				</div>
			</div>

			{/* 图例 */}
			<div className="mt-3 text-[10px] text-gray-500 flex flex-wrap gap-4 justify-center">
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-amber-500 rounded"></div>
					<span>主元</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-emerald-500/30 border border-emerald-600 rounded"></div>
					<span>交换行</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-3 bg-cyan-500/30 border border-cyan-600 rounded"></div>
					<span>消元行</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="w-3 h-0.5 bg-cyan-600"></div>
					<span>增广列</span>
				</div>
			</div>

			{/* 操作说明 */}
			{m !== undefined && (
				<div className="mt-2 text-xs text-gray-400 text-center">
					消元倍数: m = {m.toFixed(3)}
				</div>
			)}
		</div>
	);
};

export default MatrixVisualizer;
