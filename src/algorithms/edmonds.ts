import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e7+10;
constexpr int maxm=4e5+10;
int n,m,r;
typedef struct edge
{
	int u,v,w;
	edge()=default;
	edge(int a,int b,int c):u(a),v(b),w(c){}
}edge;
edge es[maxm];
int mn[maxn],pre[maxn];
int cir_cnt;
int vis[maxn],id[maxn];
int Edmonds()
{
	int res=0;
	while(1)
	{
		for(int i=0;i<=n;++i)
		{
			mn[i]=INF;
		}
		for(int i=1;i<=m;++i)
		{
			auto &e=es[i];
			if(e.v==r||e.u==e.v)
			{
				continue;
			}
			if(e.w<mn[e.v])
			{
				mn[e.v]=e.w;
				pre[e.v]=e.u;
			}
		}
		for(int i=1;i<=n;++i)
		{
			if(i!=r&&mn[i]==INF)
			{
				return -1;
			}
		}
		for(int i=0;i<=n;++i)
		{
			id[i]=vis[i]=0;
		}
		mn[r]=0;
		cir_cnt=0;
		for(int i=1,v;i<=n;++i)
		{
			res+=mn[i];
			v=i;
			while(vis[v]!=i&&!id[v]&&v!=r)
			{
				vis[v]=i;
				v=pre[v];
			}
			if(v!=r&&!id[v])
			{
				++cir_cnt;
				for(int u=pre[v];u!=v;u=pre[u])
				{
					id[u]=cir_cnt;
				}
				id[v]=cir_cnt;
			}
		}
		if(!cir_cnt)
		{
			break;
		}
		for(int i=1;i<=n;++i)
		{
			if(!id[i])
			{
				id[i]=++cir_cnt;
			}
		}
		for(int i=1;i<=m;++i)
		{
			auto &u=es[i].u;
			auto &v=es[i].v;
			auto &w=es[i].w;
			if(id[u]!=id[v])
			{
				w-=mn[v];
			}
			u=id[u];
			v=id[v];
		}
		n=cir_cnt;
		r=id[r];
	}
	return res;
}
signed main()
{
	scanf("%lld%lld%lld",&n,&m,&r);
	for(int i=1,u,v,w;i<=m;++i)
	{
		scanf("%lld%lld%lld",&u,&v,&w);
		es[i]=edge(u,v,w);
	}
	int ans=Edmonds();
	printf("%lld",ans);
	return 0;
}`;

const DEFAULT_INPUT = `4 6 1
1 2 3
1 3 5
2 3 2
2 4 4
3 4 1
4 1 2`;

export const edmondsAlgo: AlgoDef =
{
	id: 'edmonds',
	name: '朱刘算法（最小树形图）',
	category: 'graph',
	desc: '朱刘算法（Edmonds）求解有向图的最小树形图（以指定根为起点的最小生成树）。通过缩点处理环。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const firstLine = lines[0].split(/\s+/).map(Number);
		let n = firstLine[0];
		const m = firstLine[1];
		let r = firstLine[2];

		steps.push({
			desc: `n=${n}, m=${m}, 根 r=${r}`,
			line: 62,
			vars: { n, m, r },
		});

		const edges: { u: number; v: number; w: number }[] = [];
		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			edges.push({ u: parts[0], v: parts[1], w: parts[2] });
		}

		// 构建图结构数据
		const buildGraphData = () =>
		{
			const nodes = new Set<number>();
			for (const e of edges)
			{
				nodes.add(e.u);
				nodes.add(e.v);
			}
			return {
				nodes: Array.from(nodes).map(id => ({ id })),
				edges: edges.map(e => ({ from: e.u, to: e.v, weight: e.w })),
			};
		};

		steps.push({
			desc: `读入 ${m} 条边`,
			line: 66,
			vars: { edges: edges.map(e => `${e.u}→${e.v}:${e.w}`), graph: buildGraphData() },
		});

		const INF = (Number.MAX_SAFE_INTEGER / 2) - 1;
		const mn: number[] = new Array(n + 1).fill(0);
		const pre: number[] = new Array(n + 1).fill(0);
		const vis: number[] = new Array(n + 1).fill(0);
		const id: number[] = new Array(n + 1).fill(0);
		let res = 0;
		let iter = 0;

		while (true)
		{
			++iter;
			steps.push({
				desc: `第 ${iter} 轮：当前 n=${n}, r=${r}`,
				line: 23,
				vars: { iter, n, r, res, edges: edges.map(e => `${e.u}→${e.v}:${e.w}`), graph: buildGraphData() },
			});

			// 找每个点的最小入边
			for (let i = 0; i <= n; ++i) mn[i] = INF;
			for (const e of edges)
			{
				if (e.v === r || e.u === e.v) continue;
				if (e.w < mn[e.v])
				{
					mn[e.v] = e.w;
					pre[e.v] = e.u;
				}
			}

			steps.push({
				desc: `最小入边：${Array.from({ length: n }, (_, i) => i + 1).filter(i => i !== r).map(i => `${i}:${mn[i] === INF ? '∞' : mn[i]}`).join(', ')}`,
				line: 33,
				vars: { mn: [...mn], pre: [...pre], graph: buildGraphData() },
			});

			// 检查是否有不可达点
			let reachable = true;
			for (let i = 1; i <= n; ++i)
			{
				if (i !== r && mn[i] === INF)
				{
					reachable = false;
					break;
				}
			}

			if (!reachable)
			{
				steps.push({
					desc: `存在不可达点，无解`,
					line: 38,
					vars: { res: -1 },
				});
				return steps;
			}

			// 找环
			for (let i = 0; i <= n; ++i)
			{
				id[i] = 0;
				vis[i] = 0;
			}
			mn[r] = 0;
			let cir_cnt = 0;

			for (let i = 1; i <= n; ++i)
			{
				res += mn[i];
				let v = i;
				while (vis[v] !== i && !id[v] && v !== r)
				{
					vis[v] = i;
					v = pre[v];
				}
				if (v !== r && !id[v])
				{
					++cir_cnt;
					for (let u = pre[v]; u !== v; u = pre[u])
					{
						id[u] = cir_cnt;
					}
					id[v] = cir_cnt;
				}
			}

			steps.push({
				desc: `找到 ${cir_cnt} 个环`,
				line: 50,
				vars: { cir_cnt, id: [...id], res, graph: buildGraphData() },
			});

			if (cir_cnt === 0)
			{
				steps.push({
					desc: `无环，算法结束`,
					line: 54,
					vars: { res },
				});
				break;
			}

			// 缩点
			for (let i = 1; i <= n; ++i)
			{
				if (!id[i])
				{
					id[i] = ++cir_cnt;
				}
			}

			for (const e of edges)
			{
				if (id[e.u] !== id[e.v])
				{
					e.w -= mn[e.v];
				}
				e.u = id[e.u];
				e.v = id[e.v];
			}

			n = cir_cnt;
			r = id[r];

			steps.push({
				desc: `缩点后：n=${n}, r=${r}`,
				line: 60,
				vars: { n, r, edges: edges.map(e => `${e.u}→${e.v}:${e.w}`), graph: buildGraphData() },
			});
		}

		steps.push({
			desc: `最小树形图权值 = ${res}`,
			line: 64,
			vars: { res, graph: buildGraphData() },
		});

		return steps;
	}
};
