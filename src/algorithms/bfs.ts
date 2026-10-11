import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
int n,m,s;
vector<int> gra[100010];
bool vis[100010];
int dis[100010];
void bfs()
{
	queue<int> q;
	q.emplace(s);
	vis[s]=1;
	dis[s]=0;
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		for(int v:gra[u])
		{
			if(!vis[v])
			{
				vis[v]=1;
				dis[v]=dis[u]+1;
				q.emplace(v);
			}
		}
	}
}
signed main()
{
	scanf("%d%d%d",&n,&m,&s);
	for(int i=1;i<=m;++i)
	{
		int u,v;
		scanf("%d%d",&u,&v);
		gra[u].emplace_back(v);
		gra[v].emplace_back(u);
	}
	bfs();
	for(int i=1;i<=n;++i)
	{
		printf("%d ",dis[i]);
	}
	return 0;
}`;

const DEFAULT_INPUT = `6 7 1
1 2
1 3
2 4
2 5
3 5
3 6
5 6`;

export const bfsAlgo: AlgoDef =
{
	id: 'bfs',
	name: 'BFS 广度优先搜索',
	category: 'graph',
	desc: '无权图上的广度优先搜索，可求最短路径（边数最少）。使用队列实现，逐层扩展。',
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
		const s = firstLine[2];

		const gra: number[][] = Array.from({ length: n + 1 }, () => []);

		steps.push({
			desc: `读入图：n=${n}, m=${m}, 起点 s=${s}`,
			line: 33,
			vars: { n, m, s },
		});

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1];
			gra[u].push(v);
			gra[v].push(u);
			steps.push({
				desc: `加边 ${u}—${v}（无向）`,
				line: 38,
				vars: { u, v },
			});
		}

		const vis: boolean[] = new Array(n + 1).fill(false);
		const dis: number[] = new Array(n + 1).fill(-1);
		const queue: number[] = [];

		queue.push(s);
		vis[s] = true;
		dis[s] = 0;

		steps.push({
			desc: `初始化：入队 s=${s}，vis[${s}]=true，dis[${s}]=0`,
			line: 12,
			vars: { queue: [...queue], vis: [...vis], dis: [...dis] },
		});

		while (queue.length > 0)
		{
			const u = queue.shift()!;

			steps.push({
				desc: `出队 u=${u}`,
				line: 15,
				vars: { u, queue: [...queue] },
				highlight: [String(u)],
			});

			for (const v of gra[u])
			{
				steps.push({
					desc: `检查邻居 v=${v}，vis[${v}]=${vis[v]}`,
					line: 18,
					vars: { u, v, vis: [...vis] },
					highlight: [String(u), String(v)],
				});

				if (!vis[v])
				{
					vis[v] = true;
					dis[v] = dis[u] + 1;
					queue.push(v);

					steps.push({
						desc: `访问 ${v}！vis[${v}]=true，dis[${v}]=${dis[v]}，入队`,
						line: 21,
						vars: { v, queue: [...queue], vis: [...vis], dis: [...dis] },
						highlight: [String(u), String(v)],
					});
				}
			}
		}

		const result: string[] = [];
		for (let i = 1; i <= n; ++i)
		{
			result.push(dis[i] === -1 ? '-1' : String(dis[i]));
		}
		steps.push({
			desc: `输出结果：${result.join(' ')}`,
			line: 45,
			vars: { dis: [...dis], result: result.join(' ') },
		});

		return steps;
	}
};
