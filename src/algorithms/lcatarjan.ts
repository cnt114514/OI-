import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=5e5+10;
int n,m,s;
struct node
{
	int i,v;
	node()=default;
	node(int a,int b):i(a),v(b){}
};

vector<int> gra[maxn];
vector<node> q[maxn];
int fa[maxn],vis[maxn],ans[maxn];

void init()
{
	for(int i=1;i<=n;++i) fa[i]=i;
}

int find_root(int a)
{
	if(fa[a]==a) return fa[a];
	return fa[a]=find_root(fa[a]);
}

void tarjan(int u)
{
	vis[u]=1;
	for(int v:gra[u])
	{
		if(vis[v]) continue;
		tarjan(v);
		fa[v]=u;
	}

	for(auto [i,v]:q[u])
	{
		if(vis[v])
		{
			ans[i]=find_root(v);
		}
	}
}
signed main()
{
	scanf("%lld%lld%lld",&n,&m,&s);
	init();
	for(int i=1,x,y;i<n;++i)
	{
		scanf("%lld%lld",&x,&y);
		gra[x].emplace_back(y);
		gra[y].emplace_back(x);
	}
	for(int i=1,a,b;i<=m;++i)
	{
		scanf("%lld%lld",&a,&b);
		q[a].emplace_back(i,b);
		q[b].emplace_back(i,a);
	}

	tarjan(s);

	for(int i=1;i<=m;++i)
	{
		printf("%lld\\n",ans[i]);
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 2 1
1 2
1 3
2 4
2 5
4 5
3 5`;

export const lcaTarjanAlgo: AlgoDef =
{
	id: 'lcatarjan',
	name: 'LCA (Tarjan 离线)',
	category: 'tree',
	desc: '使用 Tarjan 离线算法求 LCA，基于 DFS 和并查集，按查询顺序处理。',
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

		steps.push({
			desc: `n=${n}, m=${m}, 根=${s}`,
			line: 33,
			vars: { n, m, s },
		});

		const gra: number[][] = Array.from({ length: n + 1 }, () => []);
		for (let i = 1; i < n && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1];
			gra[u].push(v);
			gra[v].push(u);
			steps.push({
				desc: `加边 ${u}-${v}`,
				line: 37,
				vars: { u, v },
			});
		}

		const queries: [number, number][] = [];
		const q: [number, number][][] = Array.from({ length: n + 1 }, () => []);
		for (let i = n; i < n + m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const a = parts[0], b = parts[1];
			const idx = i - n + 1;
			queries.push([a, b]);
			q[a].push([idx, b]);
			q[b].push([idx, a]);
			steps.push({
				desc: `查询 ${idx}：LCA(${a}, ${b})`,
				line: 43,
				vars: { idx, a, b },
			});
		}

		const fa: number[] = new Array(n + 1);
		const vis: number[] = new Array(n + 1).fill(0);
		const ans: number[] = new Array(m + 1).fill(0);

		function find_root(a: number): number
		{
			return fa[a] === a ? a : (fa[a] = find_root(fa[a]));
		}

		steps.push({
			desc: `初始化并查集 fa[i]=i`,
			line: 34,
			vars: { fa: Array.from({ length: n + 1 }, (_, i) => i) },
		});

		for (let i = 1; i <= n; ++i) fa[i] = i;

		function tarjan(u: number)
		{
			vis[u] = 1;

			steps.push({
				desc: `tarjan(${u})：vis[${u}]=1`,
				line: 21,
				vars: { u, vis: [...vis], fa: [...fa] },
				highlight: [String(u)],
			});

			for (const v of gra[u])
			{
				if (vis[v]) continue;
				tarjan(v);
				fa[v] = u;

				steps.push({
					desc: `回溯：fa[${v}]=${u}`,
					line: 24,
					vars: { u, v, fa: [...fa] },
				});
			}

			for (const [i, v] of q[u])
			{
				if (vis[v])
				{
					ans[i] = find_root(v);
					steps.push({
						desc: `处理查询 ${i}：vis[${v}]=1，ans[${i}]=find_root(${v})=${ans[i]}`,
						line: 28,
						vars: { u, i, v, ans: [...ans] },
					});
				}
			}
		}

		tarjan(s);

		steps.push({
			desc: `查询结果：${ans.slice(1).join(', ')}`,
			line: 47,
			vars: { ans: ans.slice(1) },
		});

		return steps;
	}
};
