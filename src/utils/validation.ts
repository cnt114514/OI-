// 输入验证和资源限制工具

export interface ValidationConfig
{
	maxInputSize: number;        // 最大输入字符数
	maxLines: number;            // 最大行数
	maxNumber: number;           // 最大数值
	maxNodes: number;            // 最大节点数（图/树）
	maxEdges: number;            // 最大边数
	maxSteps: number;            // 最大执行步骤数
	maxExecutionTime: number;    // 最大执行时间（毫秒）
}

export const DEFAULT_CONFIG: ValidationConfig =
{
	maxInputSize: 50000,         // 50KB
	maxLines: 1000,              // 1000行
	maxNumber: 1e9,              // 10亿
	maxNodes: 1000,              // 1000个节点
	maxEdges: 5000,              // 5000条边
	maxSteps: 10000,             // 10000步
	maxExecutionTime: 5000,      // 5秒
};

export interface ValidationResult
{
	valid: boolean;
	error?: string;
	warnings?: string[];
}

// 验证输入大小
export function validateInputSize(input: string, config: ValidationConfig = DEFAULT_CONFIG): ValidationResult
{
	if (input.length > config.maxInputSize)
	{
		return {
			valid: false,
			error: `输入过大（${input.length} 字符），最大允许 ${config.maxInputSize} 字符`,
		};
	}

	const lines = input.trim().split('\n');
	if (lines.length > config.maxLines)
	{
		return {
			valid: false,
			error: `行数过多（${lines.length} 行），最大允许 ${config.maxLines} 行`,
		};
	}

	return { valid: true };
}

// 验证数值范围
export function validateNumbers(input: string, config: ValidationConfig = DEFAULT_CONFIG): ValidationResult
{
	const warnings: string[] = [];
	const numbers = input.match(/-?\d+/g);

	if (numbers)
	{
		for (const numStr of numbers)
		{
			const num = parseInt(numStr, 10);
			if (Math.abs(num) > config.maxNumber)
			{
				return {
					valid: false,
					error: `数值 ${num} 超出范围，最大允许 ${config.maxNumber}`,
				};
			}
		}
	}

	return { valid: true, warnings };
}

// 验证图/树的节点和边数
export function validateGraphStructure(input: string, config: ValidationConfig = DEFAULT_CONFIG): ValidationResult
{
	const lines = input.trim().split('\n');
	if (lines.length === 0) return { valid: true };

	const firstLine = lines[0].trim().split(/\s+/).map(Number);
	if (firstLine.length < 1) return { valid: true };

	const n = firstLine[0];
	const m = firstLine.length > 1 ? firstLine[1] : 0;

	if (n > config.maxNodes)
	{
		return {
			valid: false,
			error: `节点数过多（${n}），最大允许 ${config.maxNodes}`,
		};
	}

	if (m > config.maxEdges)
	{
		return {
			valid: false,
			error: `边数过多（${m}），最大允许 ${config.maxEdges}`,
		};
	}

	return { valid: true };
}

// 综合验证
export function validateInput(input: string, config: ValidationConfig = DEFAULT_CONFIG): ValidationResult
{
	// 1. 验证输入大小
	const sizeResult = validateInputSize(input, config);
	if (!sizeResult.valid) return sizeResult;

	// 2. 验证数值范围
	const numberResult = validateNumbers(input, config);
	if (!numberResult.valid) return numberResult;

	// 3. 验证图结构
	const graphResult = validateGraphStructure(input, config);
	if (!graphResult.valid) return graphResult;

	return {
		valid: true,
		warnings: [...(numberResult.warnings || []), ...(graphResult.warnings || [])],
	};
}

// 验证步骤数
export function validateSteps(steps: any[], config: ValidationConfig = DEFAULT_CONFIG): ValidationResult
{
	if (steps.length > config.maxSteps)
	{
		return {
			valid: false,
			error: `执行步骤过多（${steps.length}），最大允许 ${config.maxSteps}。请减小输入规模。`,
		};
	}

	return { valid: true };
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void
{
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function (...args: Parameters<T>)
	{
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// 限流函数
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void
{
	let inThrottle = false;

	return function (...args: Parameters<T>)
	{
		if (!inThrottle)
		{
			func(...args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

// 安全的 JSON 解析
export function safeJsonParse<T>(json: string, fallback: T): T
{
	try
	{
		return JSON.parse(json);
	}
	catch
	{
		return fallback;
	}
}

// 安全的 localStorage 操作
export const safeStorage =
{
	get: (key: string): string | null =>
	{
		try
		{
			return localStorage.getItem(key);
		}
		catch
		{
			return null;
		}
	},

	set: (key: string, value: string): void =>
	{
		try
		{
			// 检查大小限制（5MB）
			if (value.length > 5 * 1024 * 1024)
			{
				console.warn('数据过大，无法保存到 localStorage');
				return;
			}
			localStorage.setItem(key, value);
		}
		catch (e)
		{
			console.warn('localStorage 存储失败:', e);
		}
	},

	remove: (key: string): void =>
	{
		try
		{
			localStorage.removeItem(key);
		}
		catch
		{
			// 忽略错误
		}
	},
};
