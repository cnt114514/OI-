import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e3+10;
int n;
typedef struct edge
{
	int to,nxt;
	edge()=default;
	edge(int a,int b):to(a),nxt(b){}
}edge;
edge es[maxn];
int heads[maxn];
int enums;
void add_edge(int x,int y)
{
	es[++enums]={y,heads[x]};
	heads[x]=enums;
}
int in[maxn];
queue<int> boss;
vector<int> family;
void toposort()
{
	for(int i=1;i<=n;++i)
	{
		if(!in[i])
		{
			boss.emplace(i);
		}
	}
	while(!boss.empty())
	{
		int u=boss.front();
		family.emplace_back(u);
		boss.pop();
		for(int j=heads[u];j;j=es[j].nxt)
		{
			int to=es[j].to;
			--in[to];
			if(!in[to])
			{
				boss.emplace(to);
			}
		}
	}
}
signed main()
{
	scanf("%lld",&n);
	for(int i=1;i<=n;++i)
	{
		while(1)
		{
			int v;
			scanf("%lld",&v);
			if(!v) break;
			add_edge(i,v);
			++in[v];
		}
	}
	toposort();
	for(int& i:family)
	{
		printf("%lld ",i);
	}
}`;

const DEFAULT_INPUT = `5
2 3 0
4 0
5 0
0
0`;

export const topoSortAlgo: AlgoDef =
{
	id: 'toposort',
	name: '拓扑排序',
	category: 'graph',
	desc: '拓扑排序将有向无环图（DAG）的节点线性排列，使得对每条边 (u,v)，u 都在 v 之前。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);

		steps.push({
			desc: `n=${n}`,
			line: 40,
			vars: { n },
		});

		const heads: number[] = new Array(n + 1).fill(0);
		const es_to: number[] = [0, 0];
		const es_nxt: number[] = [0, 0];
		let enums = 0;
		const inDeg: number[] = new Array(n + 1).fill(0);

		function add_edge(x: number, y: number)
		{
			++enums;
			es_to.push(y);
			es_nxt.push(heads[x]);
			heads[x] = enums;
		}

		// 读入边
		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			for (const v of parts)
			{
				if (v === 0) break;
				add_edge(i, v);
				++inDeg[v];
				steps.push({
					desc: `加边 ${i}→${v}，in[${v}]=${inDeg[v]}`,
					line: 45,
					vars: { i, v, inDeg: [...inDeg] },
				});
			}
		}

		// 拓扑排序
		const queue: number[] = [];
		for (let i = 1; i <= n; ++i)
		{
			if (!inDeg[i]) queue.push(i);
		}
		steps.push({
			desc: `入度为 0 的节点入队：[${queue.join(', ')}]`,
			line: 20,
			vars: { queue: [...queue], inDeg: [...inDeg] },
		});

		const result: number[] = [];
		while (queue.length > 0)
		{
			const u = queue.shift()!;
			result.push(u);

			steps.push({
				desc: `出队 u=${u}，加入拓扑序`,
				line: 25,
				vars: { u, queue: [...queue], result: [...result], inDeg: [...inDeg] },
			});

			for (let j = heads[u]; j; j = es_nxt[j])
			{
				const to = es_to[j];
				--inDeg[to];
				steps.push({
					desc: `邻居 to=${to}，in[${to}]-- = ${inDeg[to]}`,
					line: 29,
					vars: { u, to, inDeg: [...inDeg], queue: [...queue] },
				});

				if (!inDeg[to])
				{
					queue.push(to);
					steps.push({
						desc: `in[${to}]=0，入队`,
						line: 31,
						vars: { to, queue: [...queue], inDeg: [...inDeg] },
					});
				}
			}
		}

		steps.push({
			desc: `拓扑排序完成：[${result.join(', ')}]`,
			line: 48,
			vars: { result: [...result] },
		});

		return steps;
	}
};
