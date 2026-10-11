import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
int n,m;
int tree[500010];
int lowbit(int x)
{
	return x&(-x);
}
void add(int x,int k)
{
	for(int i=x;i<=n;i+=lowbit(i))
	{
		tree[i]+=k;
	}
}
int query(int x)
{
	int sum=0;
	for(int i=x;i>0;i-=lowbit(i))
	{
		sum+=tree[i];
	}
	return sum;
}
signed main()
{
	scanf("%lld%lld",&n,&m);
	for(int i=1;i<=n;++i)
	{
		int x;
		scanf("%lld",&x);
		add(i,x);
	}
	for(int i=1;i<=m;++i)
	{
		int op,x,y;
		scanf("%lld%lld%lld",&op,&x,&y);
		if(op==1)
		{
			add(x,y);
		}
		else
		{
			printf("%lld\\n",query(y)-query(x-1));
		}
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 5
1 2 3 4 5
1 3 2
2 2 5
1 1 3
2 1 4
2 3 5`;

export const bitAlgo: AlgoDef =
{
	id: 'bit',
	name: '树状数组 (BIT)',
	category: 'tree',
	desc: '树状数组（Binary Indexed Tree），支持单点修改和前缀求和。每次操作时间复杂度 O(log n)。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const firstLine = lines[0].split(/\s+/).map(Number);
		const n = firstLine[0];
		const m = firstLine[1];

		const tree: number[] = new Array(n + 1).fill(0);

		function lowbit(x: number): number
		{
			return x & (-x);
		}

		function add(x: number, k: number)
		{
			for (let i = x; i <= n; i += lowbit(i))
			{
				tree[i] += k;
			}
		}

		function query(x: number): number
		{
			let sum = 0;
			for (let i = x; i > 0; i -= lowbit(i))
			{
				sum += tree[i];
			}
			return sum;
		}

		steps.push({
			desc: `初始化：n=${n}, m=${m}，tree 数组全为 0`,
			line: 33,
			vars: { n, m, tree: [...tree] },
		});

		// 读入初始数组
		if (lines.length > 1)
		{
			const initArr = lines[1].split(/\s+/).map(Number);
			for (let i = 0; i < initArr.length && i < n; ++i)
			{
				const x = initArr[i];
				const pos = i + 1;
				add(pos, x);
				steps.push({
					desc: `初始数组 a[${pos}]=${x}，执行 add(${pos}, ${x})`,
					line: 37,
					vars: { n, pos, x, tree: [...tree] },
				});
			}
		}

		// 处理操作
		let lineIdx = 2;
		for (let i = 1; i <= m && lineIdx < lines.length; ++i, ++lineIdx)
		{
			const parts = lines[lineIdx].split(/\s+/).map(Number);
			const op = parts[0], x = parts[1], y = parts[2];

			if (op === 1)
			{
				add(x, y);
				steps.push({
					desc: `操作 1：add(${x}, ${y})，在位置 ${x} 加上 ${y}`,
					line: 44,
					vars: { n, op, x, y, tree: [...tree] },
				});
			}
			else
			{
				const ans = query(y) - query(x - 1);
				steps.push({
					desc: `操作 2：query(${y}) - query(${x - 1}) = ${query(y)} - ${query(x - 1)} = ${ans}`,
					line: 48,
					vars: { n, op, x, y, ans, tree: [...tree] },
				});
			}
		}

		steps.push({
			desc: '所有操作执行完毕',
			line: 52,
			vars: { n, tree: [...tree] },
		});

		return steps;
	}
};
