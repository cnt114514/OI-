import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
int n,m;
int fa[100010];
int find(int x)
{
	if(fa[x]==x) return x;
	return fa[x]=find(fa[x]);
}
void merge(int x,int y)
{
	int fx=find(x);
	int fy=find(y);
	if(fx!=fy) fa[fx]=fy;
}
signed main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;++i)
	{
		fa[i]=i;
	}
	for(int i=1;i<=m;++i)
	{
		int op,x,y;
		scanf("%d%d%d",&op,&x,&y);
		if(op==1)
		{
			merge(x,y);
		}
		else
		{
			if(find(x)==find(y))
			{
				puts("Y");
			}
			else
			{
				puts("N");
			}
		}
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 6
1 1 2
1 2 3
2 1 3
2 1 4
1 3 4
2 1 4`;

export const unionFindAlgo: AlgoDef =
{
	id: 'unionfind',
	name: '并查集 (Union-Find)',
	category: 'graph',
	desc: '并查集用于处理集合的合并与查询问题，支持路径压缩优化。',
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

		const fa: number[] = new Array(n + 1);

		function find(x: number): number
		{
			if (fa[x] === x) return x;
			return fa[x] = find(fa[x]);
		}

		function merge(x: number, y: number)
		{
			const fx = find(x);
			const fy = find(y);
			if (fx !== fy) fa[fx] = fy;
		}

		steps.push({
			desc: `初始化：n=${n}, m=${m}`,
			line: 24,
			vars: { n, m },
		});

		for (let i = 1; i <= n; ++i)
		{
			fa[i] = i;
		}
		steps.push({
			desc: `初始化 fa[i]=i，每个元素自成一个集合`,
			line: 26,
			vars: { n, fa: [...fa] },
		});

		let lineIdx = 1;
		for (let i = 1; i <= m && lineIdx < lines.length; ++i, ++lineIdx)
		{
			const parts = lines[lineIdx].split(/\s+/).map(Number);
			const op = parts[0], x = parts[1], y = parts[2];

			if (op === 1)
			{
				merge(x, y);
				steps.push({
					desc: `操作 1：merge(${x}, ${y})，合并集合`,
					line: 32,
					vars: { n, op, x, y, fa: [...fa] },
				});
			}
			else
			{
				const fx = find(x);
				const fy = find(y);
				const same = fx === fy;
				steps.push({
					desc: `操作 2：find(${x})=${fx}, find(${y})=${fy}，${same ? '同一集合' : '不同集合'}`,
					line: 36,
					vars: { n, op, x, y, fx, fy, same, fa: [...fa] },
				});
			}
		}

		steps.push({
			desc: '所有操作执行完毕',
			line: 44,
			vars: { n, fa: [...fa] },
		});

		return steps;
	}
};
