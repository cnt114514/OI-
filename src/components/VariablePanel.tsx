import React from 'react';
import { SimStep } from '../types';

interface VariablePanelProps
{
	step: SimStep | null;
}

const VariablePanel: React.FC<VariablePanelProps> = ({ step }) =>
{
	if (!step)
	{
		return (
			<div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
				<h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
					<span>📊</span> 变量状态
				</h3>
				<p className="text-gray-600 text-xs">点击"运行"查看变量变化...</p>
			</div>
		);
	}

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4 overflow-auto max-h-[350px]">
			<h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
				<span>📊</span> 变量状态
			</h3>
			<div className="space-y-2">
				{Object.entries(step.vars).map(([name, val]) => (
					<div key={name} className="animate-fade-in">
						<div className="flex items-start gap-2">
							<span className="text-amber-400 font-mono text-xs font-bold min-w-[70px]">
								{name}
							</span>
							<div className="text-xs">
								{renderVal(val)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

function renderVal(val: any): React.ReactNode
{
	if (val === null || val === undefined)
		return <span className="text-orange-400">null</span>;
	if (typeof val === 'boolean')
		return <span className="text-orange-400">{val ? 'true' : 'false'}</span>;
	if (typeof val === 'number')
	{
		if (val > 1e15 || val === Infinity || val === -Infinity) return <span className="text-cyan-400 font-bold">INF</span>;
		return <span className="text-cyan-400">{val}</span>;
	}
	if (typeof val === 'string')
		return <span className="text-green-400">"{val}"</span>;
	if (Array.isArray(val))
	{
		if (val.length === 0) return <span className="text-gray-600">[]</span>;
		if (val.length <= 12)
		{
			return (
				<span className="text-gray-300">
					[{val.map((v, i) => (
						<span key={i}>
							{i > 0 && ', '}
							{typeof v === 'string' ? `"${v}"` : v === true ? 'true' : v === false ? 'false' : (typeof v === 'number' && (v > 1e15 || v === Infinity || v === -Infinity)) ? <span className="text-cyan-400 font-bold">INF</span> : String(v)}
						</span>
					))}]
				</span>
			);
		}
		return <span className="text-gray-300">[{val.length} items]</span>;
	}
	if (typeof val === 'object')
	{
		return <span className="text-gray-300">{'{...}'}</span>;
	}
	return <span className="text-gray-300">{String(val)}</span>;
}

export default VariablePanel;
