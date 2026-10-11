import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=5e3+10;
constexpr int maxm=2*5e4+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n,m,s,t,maxf,minw,enums;
int h[maxn],dis[maxn],incf[maxn],pre[maxn],heads[maxn],inq[maxn];
typedef struct edge
{
	int to,nxt,c,w;
	edge()=default;
	edge(int a,int b,int c,int d):to(a),nxt(b),c(c),w(d){}
}edge;
edge es[maxm];
void add_edge(int x,int y,int c,int w)
{
	es[++enums]={y,heads[x],c,w};
	heads[x]=enums;
}
void add_flow(int u,int v,int c,int w)
{
	add_edge(u,v,c,w);
	add_edge(v,u,0,-w);
}
void spfa(int n,int s)
{
	for(int i=1;i<=n;++i)
	{
		h[i]=INF;
		inq[i]=0;
	}
	h[s]=0;
	queue<int> q;
	q.emplace(s);
	inq[s]=1;
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		inq[u]=0;
		if(h[u]==INF) continue;
		for(int i=heads[u];i;i=es[i].nxt)
		{
			int &v=es[i].to;
			int &w=es[i].w;
			int &c=es[i].c;
			if(c&&h[v]>h[u]+w)
			{
				h[v]=h[u]+w;
				if(!inq[v])
				{
					q.emplace(v);
					inq[v]=1;
				}
			}
		}
	}
}
typedef struct node
{
	int v,dis;
	node()=default;
	node(int a,int b):v(a),dis(b){}
	bool operator<(const node& x) const
	{
		return this-> dis>x.dis;
	}
}node;
bool dijkstra()
{
	priority_queue<node> q;
	for(int i=1;i<=n;++i)
	{
		dis[i]=INF;
		inq[i]=0;
	}
	dis[s]=0;
	q.emplace(s,0);
	incf[s]=INF;
	while(!q.empty())
	{
		int u=q.top().v;
		q.pop();
		if(inq[u]) continue;
		inq[u]=1;
		for(int i=heads[u];i;i=es[i].nxt)
		{
			int &v=es[i].to;
			int &w=es[i].w;
			int &c=es[i].c;
			int w1=w+h[u]-h[v];
			if(c&&dis[v]>dis[u]+w1)
			{
				dis[v]=dis[u]+w1;
				incf[v]=min(incf[u],c);
				pre[v]=i;
				q.emplace(v,dis[v]);
			}
		}
	}
	return dis[t]!=INF;
}
void update()
{
	for(int i=1;i<=n;++i)
	{
		if(dis[i]!=INF)
		{
			h[i]+=dis[i];
		}
	}
	int u=t;
	while(u!=s)
	{
		int i=pre[u];
		es[i].c-=incf[t];
		es[i^1].c+=incf[t];
		u=es[i^1].to;
	}
	maxf+=incf[t];
	minw+=incf[t]*h[t];
}
void EK()
{
	spfa(n,s);
	while(dijkstra())
	{
		update();
	}
}
signed main()
{
	scanf("%lld%lld%lld%lld",&n,&m,&s,&t);
	enums=1;
	for(int i=1,u,v,w,c;i<=m;++i)
	{
		scanf("%lld%lld%lld%lld",&u,&v,&c,&w);
		add_flow(u,v,c,w);
	}
	maxf=0,minw=0;
	EK();
	printf("%lld %lld",maxf,minw);
	return 0;
}`;

const DEFAULT_INPUT = `4 5 1 4
1 2 3 1
1 3 2 2
2 3 1 1
2 4 2 3
3 4 3 2`;

export const mcmfAlgo: AlgoDef =
{
	id: 'mcmf',
	name: '最小费用最大流（原始对偶）',
	category: 'graph',
	desc: '使用 SPFA + Dijkstra 的原始对偶算法求解最小费用最大流。先用 SPFA 求初始势能，然后用 Dijkstra 找最短增广路。',
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
		const t = firstLine[3];

		steps.push({
			desc: `n=${n}, m=${m}, s=${s}, t=${t}，读入网络`,
			line: 103,
			vars: { n, m, s, t },
		});

		const es_to: number[] = [0, 0];
		const es_nxt: number[] = [0, 0];
		const es_c: number[] = [0, 0];
		const es_w: number[] = [0, 0];
		const heads: number[] = new Array(n + 1).fill(0);
		let enums = 1;

		const origEdges: { from: number; to: number; cap: number; cost: number; idx: number }[] = [];

		function add_edge(x: number, y: number, c: number, w: number)
		{
			++enums;
			es_to.push(y);
			es_nxt.push(heads[x]);
			es_c.push(c);
			es_w.push(w);
			heads[x] = enums;
		}

		function add_flow(u: number, v: number, c: number, w: number)
		{
			add_edge(u, v, c, w);
			const idx = enums;
			add_edge(v, u, 0, -w);
			origEdges.push({ from: u, to: v, cap: c, cost: w, idx });
		}

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			add_flow(parts[0], parts[1], parts[2], parts[3]);
		}

		function getEdgeStates()
		{
			return origEdges.map(e => ({
				from: e.from,
				to: e.to,
				cap: e.cap,
				cost: e.cost,
				flow: e.cap - es_c[e.idx]
			}));
		}

		steps.push({
			desc: `读入 ${m} 条边`,
			line: 107,
			vars: { n, m, s, t, maxf: 0, minw: 0, edgeStates: getEdgeStates() },
		});

		const INF = (Number.MAX_SAFE_INTEGER / 2) - 1;
		const h: number[] = new Array(n + 1).fill(0);
		const dis: number[] = new Array(n + 1).fill(0);
		const incf: number[] = new Array(n + 1).fill(0);
		const pre: number[] = new Array(n + 1).fill(0);
		const inq: number[] = new Array(n + 1).fill(0);
		let maxf = 0;
		let minw = 0;

		function spfa()
		{
			for (let i = 1; i <= n; ++i)
			{
				h[i] = INF;
				inq[i] = 0;
			}
			h[s] = 0;
			const queue: number[] = [];
			queue.push(s);
			inq[s] = 1;

			while (queue.length > 0)
			{
				const u = queue.shift()!;
				inq[u] = 0;
				if (h[u] === INF) continue;

				for (let i = heads[u]; i; i = es_nxt[i])
				{
					const v = es_to[i];
					const w = es_w[i];
					const c = es_c[i];
					if (c && h[v] > h[u] + w)
					{
						h[v] = h[u] + w;
						if (!inq[v])
						{
							queue.push(v);
							inq[v] = 1;
						}
					}
				}
			}
		}

		spfa();
		steps.push({
			desc: `SPFA 求初始势能`,
			line: 93,
			vars: { h: [...h], maxf, minw, edgeStates: getEdgeStates() },
		});

		function dijkstra(): boolean
		{
			for (let i = 1; i <= n; ++i)
			{
				dis[i] = INF;
				inq[i] = 0;
			}
			dis[s] = 0;
			incf[s] = INF;

			const pq: { v: number; dis: number }[] = [];
			pq.push({ v: s, dis: 0 });

			while (pq.length > 0)
			{
				pq.sort((a, b) => a.dis - b.dis);
				const u = pq.shift()!.v;
				if (inq[u]) continue;
				inq[u] = 1;

				for (let i = heads[u]; i; i = es_nxt[i])
				{
					const v = es_to[i];
					const w = es_w[i];
					const c = es_c[i];
					const w1 = w + h[u] - h[v];
					if (c && dis[v] > dis[u] + w1)
					{
						dis[v] = dis[u] + w1;
						incf[v] = Math.min(incf[u], c);
						pre[v] = i;
						pq.push({ v, dis: dis[v] });
					}
				}
			}

			return dis[t] !== INF;
		}

		function update()
		{
			for (let i = 1; i <= n; ++i)
			{
				if (dis[i] !== INF)
				{
					h[i] += dis[i];
				}
			}

			let u = t;
			while (u !== s)
			{
				const i = pre[u];
				es_c[i] -= incf[t];
				es_c[i ^ 1] += incf[t];
				u = es_to[i ^ 1];
			}
			maxf += incf[t];
			minw += incf[t] * h[t];
		}

		let iter = 0;
		while (dijkstra())
		{
			++iter;

			const path: number[] = [];
			let u = t;
			while (u !== s)
			{
				path.push(u);
				u = es_to[pre[u] ^ 1];
			}
			path.push(s);
			path.reverse();

			steps.push({
				desc: `第 ${iter} 次 Dijkstra：找到增广路 ${path.join('→')}，流量 ${incf[t]}，单位费用 ${h[t]}`,
				line: 88,
				vars: { iter, maxf, minw, h: [...h], dis: [...dis], edgeStates: getEdgeStates() },
				highlight: path.map(String),
			});

			update();

			steps.push({
				desc: `增广：maxf=${maxf}, minw=${minw}`,
				line: 91,
				vars: { iter, maxf, minw, h: [...h], edgeStates: getEdgeStates() },
				highlight: path.map(String),
			});
		}

		steps.push({
			desc: `最小费用最大流：maxf=${maxf}, minw=${minw}`,
			line: 111,
			vars: { maxf, minw, edgeStates: getEdgeStates() },
		});

		return steps;
	}
};
