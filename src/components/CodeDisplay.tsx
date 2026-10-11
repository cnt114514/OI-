import React from 'react';

interface CodeDisplayProps
{
	code: string;
	currentLine: number;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, currentLine }) =>
{
	const lines = code.split('\n');

	return (
		<div className="bg-gray-950 rounded-xl border border-gray-700 overflow-hidden">
			<div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
				<div className="w-3 h-3 rounded-full bg-red-500/80"></div>
				<div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
				<div className="w-3 h-3 rounded-full bg-green-500/80"></div>
				<span className="ml-2 text-xs text-gray-500 font-mono">solution.cpp</span>
			</div>
			<div className="p-3 overflow-auto max-h-[420px] font-mono text-[13px] leading-relaxed">
				{lines.map((line, idx) =>
				{
					const lineNum = idx + 1;
					const isActive = lineNum === currentLine;
					return (
						<div
							key={idx}
							className={`flex transition-all duration-200 rounded-sm ${
								isActive
									? 'bg-amber-500/15 border-l-2 border-amber-400'
									: 'border-l-2 border-transparent'
							}`}
						>
							<span className={`select-none w-10 text-right mr-3 flex-shrink-0 ${
								isActive ? 'text-amber-400' : 'text-gray-600'
							}`}>
								{lineNum}
							</span>
							<pre className="m-0 p-0 whitespace-pre">
								<span className={`${isActive ? 'text-amber-100' : 'text-gray-400'}`}>
									{line}
								</span>
							</pre>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default CodeDisplay;
