import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e4+10;
constexpr int maxm=1e5+10;
int n,m;
int dfn[maxn],low[maxn];
int stk[maxn],instk[maxn];
int time_cnt;
int scc_cnt;
int scct[maxn];
vector<int> scc[maxn];
vector<int> gra[maxn];
void tarjan(int x)
{
	++time_cnt;
	stk[++stk[0]]=x;
	instk[x]=1;
	dfn[x]=low[x]=time_cnt;
	for(int to:gra[x])
	{
		if(!dfn[to])
		{
			tarjan(to);
			low[x]=min(low[x],low[to]);
		}
		else if(instk[to])
		{
			low[x]=min(low[x],dfn[to]);
		}
	}
	if(dfn[x]==low[x])
	{
		++scc_cnt;
		while(stk[stk[0]]!=x)
		{
			scc[scc_cnt].emplace_back(stk[stk[0]]);
			instk[stk[stk[0]]]=0;
			scct[stk[stk[0]]]=scc_cnt;
			--stk[0];
		}
		scc[scc_cnt].emplace_back(x);
		instk[x]=0;
		scct[x]=scc_cnt;
		--stk[0];
	}
}
signed main()
{
	scanf("%lld%lld",&n,&m);
	for(int i=1,u,v;i<=m;++i)
	{
		scanf("%lld%lld",&u,&v);
		gra[u].emplace_back(v);
	}
	for(int i=1;i<=n;++i)
	{
		if(!dfn[i]) tarjan(i);
	}
	printf("%lld\\n",scc_cnt);
	for(int i=1;i<=scc_cnt;++i)
	{
		sort(scc[i].begin(),scc[i].end());
		for(int x:scc[i])
		{
			printf("%lld ",x);
		}
		printf("\\n");
	}
	return 0;
}`;

const DEFAULT_INPUT = `6 8
1 2
2 3
3 1
3 4
4 5
5 6
6 4
2 6`;

export const tarjanSCCAlgo: AlgoDef =
{
	id: 'tarjanscc',
	name: '强连通分量 (Tarjan)',
	category: 'graph',
	desc: '使用 Tarjan 算法求有向图的强连通分量，基于 DFS 和栈。',
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

		steps.push({
			desc: `n=${n}, m=${m}`,
			line: 43,
			vars: { n, m },
		});

		const gra: number[][] = Array.from({ length: n + 1 }, () => []);
		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1];
			gra[u].push(v);
			steps.push({
				desc: `加边 ${u}→${v}`,
				line: 47,
				vars: { u, v },
			});
		}

		const dfn: number[] = new Array(n + 1).fill(0);
		const low: number[] = new Array(n + 1).fill(0);
		const stk: number[] = [0];
		const instk: number[] = new Array(n + 1).fill(0);
		let time_cnt = 0;
		let scc_cnt = 0;
		const scct: number[] = new Array(n + 1).fill(0);
		const scc: number[][] = [];

		function tarjan(x: number)
		{
			++time_cnt;
			stk.push(x);
			++stk[0];
			instk[x] = 1;
			dfn[x] = low[x] = time_cnt;

			steps.push({
				desc: `tarjan(${x})：dfn[${x}]=low[${x}]=${time_cnt}，入栈`,
				line: 13,
				vars: { x, dfn: [...dfn], low: [...low], stk: stk.slice(1) },
				highlight: [String(x)],
			});

			for (const to of gra[x])
			{
				if (!dfn[to])
				{
					tarjan(to);
					low[x] = Math.min(low[x], low[to]);
					steps.push({
						desc: `回溯：low[${x}]=min(${low[x]}, ${low[to]})=${low[x]}`,
						line: 18,
						vars: { x, to, low: [...low] },
					});
				}
				else if (instk[to])
				{
					low[x] = Math.min(low[x], dfn[to]);
					steps.push({
						desc: `${to} 在栈中：low[${x}]=min(${low[x]}, ${dfn[to]})=${low[x]}`,
						line: 21,
						vars: { x, to, low: [...low] },
					});
				}
			}

			if (dfn[x] === low[x])
			{
				++scc_cnt;
				scc.push([]);
				steps.push({
					desc: `dfn[${x}]=low[${x}]=${dfn[x]}，发现第 ${scc_cnt} 个 SCC`,
					line: 25,
					vars: { x, scc_cnt, dfn: [...dfn], low: [...low], stk: stk.slice(1), scc: scc.map(s => [...s]) },
				});

				while (stk[stk[0]] !== x)
				{
					const node = stk[stk[0]];
					scc[scc_cnt - 1].push(node);
					instk[node] = 0;
					scct[node] = scc_cnt;
					--stk[0];
					stk.pop();
				}
				scc[scc_cnt - 1].push(x);
				instk[x] = 0;
				scct[x] = scc_cnt;
				--stk[0];
				stk.pop();

				steps.push({
					desc: `SCC ${scc_cnt} = [${scc[scc_cnt - 1].sort((a, b) => a - b).join(', ')}]`,
					line: 32,
					vars: { scc_cnt, dfn: [...dfn], low: [...low], stk: stk.slice(1), scc: scc.map(s => [...s]) },
				});
			}
		}

		for (let i = 1; i <= n; ++i)
		{
			if (!dfn[i])
			{
				tarjan(i);
			}
		}

		steps.push({
			desc: `共 ${scc_cnt} 个强连通分量`,
			line: 53,
			vars: { scc_cnt, scc },
		});

		return steps;
	}
};
