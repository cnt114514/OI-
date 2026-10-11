import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
int n,m;
vector<int> gra[100010];
bool vis[100010];
void dfs(int u)
{
	vis[u]=1;
	printf("%d ",u);
	for(int v:gra[u])
	{
		if(!vis[v]) dfs(v);
	}
}
signed main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=m;++i)
	{
		int u,v;
		scanf("%d%d",&u,&v);
		gra[u].push_back(v);
		gra[v].push_back(u);
	}
	dfs(1);
	return 0;
}`;

const DEFAULT_INPUT = `6 7
1 2
1 3
2 4
2 5
3 5
3 6
5 6`;

export const dfsAlgo: AlgoDef =
{
	id: 'dfs',
	name: 'DFS 深度优先搜索',
	category: 'graph',
	desc: '深度优先搜索从起始节点开始，沿着一条路径尽可能深入，直到无法继续时回溯。',
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

		const gra: number[][] = Array.from({ length: n + 1 }, () => []);

		steps.push({
			desc: `读入图：n=${n}, m=${m}`,
			line: 16,
			vars: { n, m },
		});

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1];
			gra[u].push(v);
			gra[v].push(u);
			steps.push({
				desc: `加边 ${u}-${v}（无向）`,
				line: 21,
				vars: { u, v },
			});
		}

		const vis: boolean[] = new Array(n + 1).fill(false);
		const order: number[] = [];

		function dfs(u: number, depth: number = 0)
		{
			vis[u] = true;
			order.push(u);

			steps.push({
				desc: `${'  '.repeat(depth)}访问节点 ${u}`,
				line: 8,
				vars: { u, vis: [...vis], order: [...order] },
				highlight: [String(u)],
			});

			for (const v of gra[u])
			{
				if (!vis[v])
				{
					steps.push({
						desc: `${'  '.repeat(depth)}邻居 ${v} 未访问，递归`,
						line: 11,
						vars: { u, v, vis: [...vis] },
						highlight: [String(u), String(v)],
					});
					dfs(v, depth + 1);
				}
			}

			steps.push({
				desc: `${'  '.repeat(depth)}节点 ${u} 回溯`,
				line: 12,
				vars: { u, vis: [...vis], order: [...order] },
			});
		}

		steps.push({
			desc: `从节点 1 开始 DFS`,
			line: 24,
			vars: { vis: [...vis] },
		});

		dfs(1);

		steps.push({
			desc: `DFS 完成，访问顺序：[${order.join(', ')}]`,
			line: 25,
			vars: { order: [...order], vis: [...vis] },
		});

		return steps;
	}
};
