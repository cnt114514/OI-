import React from 'react';
import { SimStep } from '../types';

interface StepLogProps
{
	steps: SimStep[];
	currentIdx: number;
}

const StepLog: React.FC<StepLogProps> = ({ steps, currentIdx }) =>
{
	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>📋</span> 执行日志
			</h3>
			<div className="space-y-1 max-h-[200px] overflow-auto">
				{steps.slice(Math.max(0, currentIdx - 5), currentIdx + 1).map((step, idx) =>
				{
					const actualIdx = Math.max(0, currentIdx - 5) + idx;
					const isCurrent = actualIdx === currentIdx;
					return (
						<div
							key={actualIdx}
							className={`text-xs p-2 rounded transition-all ${
								isCurrent
									? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-200'
									: 'text-gray-500'
							}`}
						>
							<span className="text-gray-600 mr-2">#{actualIdx + 1}</span>
							{step.desc}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default StepLog;
