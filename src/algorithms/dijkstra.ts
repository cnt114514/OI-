import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=4e5+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n,m,s;
int head[maxn];
int enums;
struct edge
{
	int to,nxt,w;
	edge()=default;
	edge(int a,int b,int c):to(a),nxt(b),w(c){}
};
edge es[1000010];
void add_edge(int u,int v,int w)
{
	es[++enums]={v,head[u],w};
	head[u]=enums;
}
struct node
{
	int p,wei;
	node()=default;
	node(int a,int b):p(a),wei(b){}
	bool operator<(const node&o)const
	{
		return this->wei>o.wei;
	}
};
int dis[maxn];
bool vis[maxn];
void dijkstra()
{
	priority_queue<node> qr;
	for(int i=1;i<=n;++i)
	{
		dis[i]=INF;
		vis[i]=0;
	}
	dis[s]=0;
	qr.emplace(node(s,0));
	while(!qr.empty())
	{
		int u=qr.top().p;
		qr.pop();
		if(!vis[u])
		{
			vis[u]=1;
			for(int i=head[u];i;i=es[i].nxt)
			{
				int v=es[i].to;
				int w=es[i].w;
				if(dis[u]+w<dis[v])
				{
					dis[v]=dis[u]+w;
					qr.emplace(node(v,dis[v]));
				}
			}
		}
	}
}
signed main()
{
	scanf("%lld%lld%lld",&n,&m,&s);
	for(int i=1;i<=m;++i)
	{
		int u,v,w;
		scanf("%lld%lld%lld",&u,&v,&w);
		add_edge(u,v,w);
	}
	dijkstra();
	for(int i=1;i<=n;++i)
	{
		printf("%lld ",dis[i]);
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 7 1
1 2 4
1 3 2
2 3 1
2 4 5
3 5 8
4 5 2
4 6 6`;

export const dijkstraAlgo: AlgoDef =
{
	id: 'dijkstra',
	name: 'Dijkstra 单源最短路',
	category: 'graph',
	desc: '使用优先队列优化的 Dijkstra 算法，求解从源点 s 到所有节点的最短路径。时间复杂度 O((n+m)log n)。',
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

		const INF = Number.MAX_SAFE_INTEGER / 2;
		const head: number[] = new Array(n + 1).fill(0);
		const es_to: number[] = [0, 0];
		const es_nxt: number[] = [0, 0];
		const es_w: number[] = [0, 0];
		let enums = 1;

		function add_edge(u: number, v: number, w: number)
		{
			++enums;
			es_to.push(v);
			es_nxt.push(head[u]);
			es_w.push(w);
			head[u] = enums;
		}

		steps.push({
			desc: `读入图：n=${n}, m=${m}, 源点 s=${s}`,
			line: 52,
			vars: { n, m, s },
		});

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			const u = parts[0], v = parts[1], w = parts[2];
			add_edge(u, v, w);
			steps.push({
				desc: `加边 ${u}→${v}，权值 ${w}`,
				line: 56,
				vars: { u, v, w, enums },
			});
		}

		const dis: number[] = new Array(n + 1).fill(INF);
		const vis: boolean[] = new Array(n + 1).fill(false);

		steps.push({
			desc: `初始化：所有 dis[i]=INF，vis[i]=false`,
			line: 30,
			vars: { dis: { ...dis }, vis: [...vis] },
		});

		dis[s] = 0;
		steps.push({
			desc: `dis[${s}]=0，将 (${s},0) 入队`,
			line: 34,
			vars: { dis: { ...dis }, queue: [[s, 0]] },
		});

		const pq: [number, number][] = [[s, 0]];

		while (pq.length > 0)
		{
			pq.sort((a, b) => a[1] - b[1]);
			const [u] = pq.shift()!;

			steps.push({
				desc: `出队节点 u=${u}（当前最小距离 dis[${u}]=${dis[u]}）`,
				line: 37,
				vars: { u, dis: { ...dis }, vis: [...vis], pq: pq.map(x => [...x]) },
				highlight: [String(u)],
			});

			if (vis[u])
			{
				steps.push({
					desc: `节点 ${u} 已访问，跳过`,
					line: 39,
					vars: { u, vis: [...vis] },
				});
				continue;
			}

			vis[u] = true;
			steps.push({
				desc: `标记 vis[${u}]=true`,
				line: 41,
				vars: { u, vis: [...vis] },
				highlight: [String(u)],
			});

			for (let i = head[u]; i; i = es_nxt[i])
			{
				const v = es_to[i];
				const w = es_w[i];

				steps.push({
					desc: `检查边 ${u}→${v}，权值 w=${w}，当前 dis[${v}]=${dis[v] === INF ? 'INF' : dis[v]}`,
					line: 44,
					vars: { u, v, w, dis: { ...dis } },
					highlight: [String(u), String(v)],
				});

				if (dis[u] + w < dis[v])
				{
					dis[v] = dis[u] + w;
					pq.push([v, dis[v]]);
					steps.push({
						desc: `松弛成功！dis[${v}] 更新为 ${dis[v]}，(${v},${dis[v]}) 入队`,
						line: 48,
						vars: { v, dis: { ...dis }, pq: pq.map(x => [...x]) },
						highlight: [String(u), String(v)],
					});
				}
			}
		}

		const result: string[] = [];
		for (let i = 1; i <= n; ++i)
		{
			result.push(dis[i] >= INF / 2 ? 'INF' : String(dis[i]));
		}
		steps.push({
			desc: `输出结果：${result.join(' ')}`,
			line: 62,
			vars: { dis: { ...dis }, result: result.join(' ') },
		});

		return steps;
	}
};
