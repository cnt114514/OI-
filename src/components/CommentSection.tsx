import React, { useState, useEffect } from 'react';
import { safeStorage, safeJsonParse } from '../utils/validation';

interface Comment
{
	id: string;
	author: string;
	content: string;
	timestamp: number;
	type: 'bug' | 'suggestion' | 'question' | 'other';
}

interface CommentSectionProps
{
	algoId: string;
	algoName: string;
}

	const CommentSection: React.FC<CommentSectionProps> = ({ algoId, algoName }) =>
	{
		const [comments, setComments] = useState<Comment[]>([]);
		const [author, setAuthor] = useState('');
		const [content, setContent] = useState('');
		const [type, setType] = useState<Comment['type']>('other');
		const [showForm, setShowForm] = useState(false);
		const [showImport, setShowImport] = useState(false);
		const [importData, setImportData] = useState('');

		useEffect(() =>
		{
			const stored = safeStorage.get(`comments-${algoId}`);
			if (stored)
			{
				setComments(safeJsonParse(stored, []));
			}
		}, [algoId]);

		const handleExport = () =>
		{
			const exportObj = { algoId, algoName, comments, exportTime: Date.now() };
			const json = JSON.stringify(exportObj, null, 2);
			navigator.clipboard.writeText(json).then(() =>
			{
				alert('评论数据已复制到剪贴板！');
			}).catch(() =>
			{
				// 降级方案
				const textarea = document.createElement('textarea');
				textarea.value = json;
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
				alert('评论数据已复制到剪贴板！');
			});
		};

		const handleImport = () =>
		{
			try
			{
				const data = JSON.parse(importData);
				if (data.comments && Array.isArray(data.comments))
				{
					const merged = [...data.comments, ...comments];
					// 去重
					const unique = merged.filter((c, i, arr) =>
						arr.findIndex(x => x.id === c.id) === i
					);
					setComments(unique);
					safeStorage.set(`comments-${algoId}`, JSON.stringify(unique));
					setShowImport(false);
					setImportData('');
					alert(`成功导入 ${data.comments.length} 条评论！`);
				}
				else
				{
					alert('无效的评论数据格式');
				}
			}
			catch
			{
				alert('JSON 解析失败，请检查数据格式');
			}
		};
	const handleSubmit = (e: React.FormEvent) =>
	{
		e.preventDefault();
		if (!author.trim() || !content.trim()) return;

		// 验证评论内容长度
		if (content.length > 1000)
		{
			alert('评论内容不能超过 1000 字符');
			return;
		}

		if (author.length > 50)
		{
			alert('昵称不能超过 50 字符');
			return;
		}

		const newComment: Comment =
		{
			id: Date.now().toString(),
			author: author.trim(),
			content: content.trim(),
			timestamp: Date.now(),
			type,
		};

		const updated = [newComment, ...comments];
		setComments(updated);
		safeStorage.set(`comments-${algoId}`, JSON.stringify(updated));

		setContent('');
		setType('other');
		setShowForm(false);
	};

	const handleDelete = (id: string) =>
	{
		const updated = comments.filter(c => c.id !== id);
		setComments(updated);
		safeStorage.set(`comments-${algoId}`, JSON.stringify(updated));
	};

	const formatTime = (timestamp: number) =>
	{
		const date = new Date(timestamp);
		return date.toLocaleString('zh-CN');
	};

	const getTypeLabel = (type: Comment['type']) =>
	{
		const labels =
		{
			bug: { text: 'Bug', color: 'bg-red-500/20 text-red-400 border-red-500' },
			suggestion: { text: '建议', color: 'bg-blue-500/20 text-blue-400 border-blue-500' },
			question: { text: '问题', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500' },
			other: { text: '其他', color: 'bg-gray-500/20 text-gray-400 border-gray-500' },
		};
		return labels[type];
	};

	return (
		<div className="bg-gray-900 rounded-xl border border-gray-700 p-4 mt-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
					<span>💬</span> 评论区 ({comments.length})
				</h3>
				<div className="flex gap-2">
					<button
						onClick={handleExport}
						disabled={comments.length === 0}
						className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs rounded-md transition-colors"
						title="导出评论数据"
					>
						📤 导出
					</button>
					<button
						onClick={() => setShowImport(!showImport)}
						className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors"
						title="导入评论数据"
					>
						📥 导入
					</button>
					<button
						onClick={() => setShowForm(!showForm)}
						className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md transition-colors"
					>
						{showForm ? '取消' : '发表评论'}
					</button>
				</div>
			</div>

			{showImport && (
				<div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
					<label className="block text-xs text-gray-400 mb-2">粘贴评论数据：</label>
					<textarea
						value={importData}
						onChange={(e) => setImportData(e.target.value)}
						className="w-full h-24 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:border-indigo-500 resize-none"
						placeholder='{"algoId":"...","comments":[...]}'
					/>
					<div className="flex gap-2 mt-2">
						<button
							onClick={handleImport}
							disabled={!importData.trim()}
							className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs rounded-md transition-colors"
						>
							确认导入
						</button>
						<button
							onClick={() => { setShowImport(false); setImportData(''); }}
							className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors"
						>
							取消
						</button>
					</div>
				</div>
			)}

			{showForm && (
				<form onSubmit={handleSubmit} className="mb-4 space-y-3">
					<div>
						<label className="block text-xs text-gray-400 mb-1">昵称</label>
						<input
							type="text"
							value={author}
							onChange={(e) => setAuthor(e.target.value)}
							className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500"
							placeholder="输入你的昵称"
							required
						/>
					</div>
					<div>
						<label className="block text-xs text-gray-400 mb-1">类型</label>
						<div className="flex gap-2">
							{(['bug', 'suggestion', 'question', 'other'] as const).map((t) =>
							{
								const label = getTypeLabel(t);
								return (
									<button
										key={t}
										type="button"
										onClick={() => setType(t)}
										className={`px-3 py-1 text-xs rounded-md border transition-colors ${
											type === t
												? label.color
												: 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
										}`}
									>
										{label.text}
									</button>
								);
							})}
						</div>
					</div>
					<div>
						<label className="block text-xs text-gray-400 mb-1">内容</label>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 resize-none"
							rows={3}
							placeholder="分享你的想法、反馈bug或提出建议..."
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-md transition-colors"
					>
						提交评论
					</button>
				</form>
			)}

			<div className="space-y-3">
				{comments.length === 0 ? (
					<p className="text-center text-gray-500 text-sm py-4">暂无评论，快来发表第一条评论吧！</p>
				) : (
					comments.map((comment) =>
					{
						const typeLabel = getTypeLabel(comment.type);
						return (
							<div key={comment.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-gray-300">{comment.author}</span>
										<span className={`px-2 py-0.5 text-[10px] rounded border ${typeLabel.color}`}>
											{typeLabel.text}
										</span>
									</div>
									<button
										onClick={() => handleDelete(comment.id)}
										className="text-gray-500 hover:text-red-400 text-xs transition-colors"
										title="删除"
									>
										×
									</button>
								</div>
								<p className="text-sm text-gray-400 mb-2 whitespace-pre-wrap">{comment.content}</p>
								<div className="text-[10px] text-gray-600">{formatTime(comment.timestamp)}</div>
							</div>
						);
					})
				)}
			</div>

			<div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
				<div className="text-xs text-blue-300">
					<strong>💡 提示：</strong>当前评论保存在本地浏览器中。使用"导出"按钮可以复制评论数据，"导入"按钮可以合并他人的评论。
				</div>
			</div>
		</div>
	);
};

export default CommentSection;
