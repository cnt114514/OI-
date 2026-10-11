import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=2e2+10;
constexpr int maxm=1e4+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n,m,s,t,maxf;
typedef struct edge
{
	int to,next,w;
	edge()=default;
	edge(int a,int b,int c):to(a),next(b),w(c){}
}edge;
edge es[maxm*2];
int heads[maxn],enums;
void add_edge(int x,int y,int w)
{
	es[++enums]={y,heads[x],w};
	heads[x]=enums;
}
void add_flow(int x,int y,int w)
{
	add_edge(x,y,w);
	add_edge(y,x,0);
}
int incf[maxn],vis[maxn],pre[maxn];
bool BFS()
{
	for(int i=1;i<=n;++i) vis[i]=0;
	queue<int> q;
	q.emplace(s);
	vis[s]=1;
	incf[s]=INF;
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		for(int i=heads[u];i;i=es[i].next)
		{
			int w=es[i].w;
			if(!w) continue;
			int v=es[i].to;
			if(vis[v]) continue;
			pre[v]=i;
			incf[v]=min(incf[u],w);
			q.emplace(v);
			vis[v]=1;
			if(v==t) return 1;
		}
	}
	return 0;
}
void update()
{
	int u=t;
	while(u!=s)
	{
		int i=pre[u];
		es[i].w-=incf[t];
		es[i^1].w+=incf[t];
		u=es[i^1].to;
	}
	maxf+=incf[t];
}
void EK()
{
	while(BFS()) update();
}
signed main()
{
	scanf("%lld%lld%lld%lld",&n,&m,&s,&t);
	enums=1;
	maxf=0;
	for(int i=1,u,v,w;i<=m;++i)
	{
		scanf("%lld%lld%lld",&u,&v,&w);
		add_flow(u,v,w);
	}
	EK();
	printf("%lld",maxf);
	return 0;
}`;

const DEFAULT_INPUT = `4 5 1 4
1 2 3
1 3 2
2 3 1
2 4 2
3 4 3`;

export const ekAlgo: AlgoDef =
{
	id: 'ek',
	name: '最大流 EK (Edmonds-Karp)',
	category: 'graph',
	desc: 'Edmonds-Karp 算法使用 BFS 寻找增广路求解最大流，时间复杂度 O(VE²)。',
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

		const es_to: number[] = [0, 0];
		const es_nxt: number[] = [0, 0];
		const es_w: number[] = [0, 0];
		const heads: number[] = new Array(n + 1).fill(0);
		let enums = 1;

		const origEdges: { from: number; to: number; cap: number; idx: number }[] = [];

		function add_edge(x: number, y: number, w: number)
		{
			++enums;
			es_to.push(y);
			es_nxt.push(heads[x]);
			es_w.push(w);
			heads[x] = enums;
		}

		function add_flow(x: number, y: number, w: number)
		{
			add_edge(x, y, w);
			const idx = enums;
			add_edge(y, x, 0);
			origEdges.push({ from: x, to: y, cap: w, idx });
		}

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			add_flow(parts[0], parts[1], parts[2]);
		}

		function getEdgeStates()
		{
			return origEdges.map(e => ({ from: e.from, to: e.to, cap: e.cap, flow: e.cap - es_w[e.idx] }));
		}

		steps.push({
			desc: `n=${n}, m=${m}, s=${s}, t=${t}，读入 ${m} 条边`,
			line: 52,
			vars: { n, m, s, t, maxf: 0, edgeStates: getEdgeStates() },
		});

		const INF = (Number.MAX_SAFE_INTEGER / 2) - 1;
		const incf: number[] = new Array(n + 1).fill(0);
		const vis: number[] = new Array(n + 1).fill(0);
		const pre: number[] = new Array(n + 1).fill(0);
		let maxf = 0;

		let iter = 0;
		while (true)
		{
			for (let i = 1; i <= n; ++i) vis[i] = 0;
			const queue: number[] = [];
			queue.push(s);
			vis[s] = 1;
			incf[s] = INF;
			let found = false;

			while (queue.length > 0 && !found)
			{
				const u = queue.shift()!;
				for (let i = heads[u]; i; i = es_nxt[i])
				{
					const w = es_w[i];
					const v = es_to[i];
					if (w > 0 && !vis[v])
					{
						pre[v] = i;
						incf[v] = Math.min(incf[u], w);
						queue.push(v);
						vis[v] = 1;
						if (v === t) { found = true; break; }
					}
				}
			}

			if (!found) break;

			++iter;
			const path: number[] = [];
			let cur = t;
			while (cur !== s)
			{
				path.push(cur);
				cur = es_to[pre[cur] ^ 1];
			}
			path.push(s);
			path.reverse();

			steps.push({
				desc: `第 ${iter} 次 BFS：增广路 ${path.join('→')}，流量 ${incf[t]}`,
				line: 33,
				vars: { iter, maxf, incf: incf[t], vis: [...vis], edgeStates: getEdgeStates() },
				highlight: path.map(String),
			});

			cur = t;
			while (cur !== s)
			{
				const i = pre[cur];
				es_w[i] -= incf[t];
				es_w[i ^ 1] += incf[t];
				cur = es_to[i ^ 1];
			}
			maxf += incf[t];

			steps.push({
				desc: `推送流量 ${incf[t]}，maxf=${maxf}`,
				line: 41,
				vars: { iter, maxf, edgeStates: getEdgeStates() },
				highlight: path.map(String),
			});
		}

		steps.push({
			desc: `最大流 = ${maxf}`,
			line: 60,
			vars: { maxf, edgeStates: getEdgeStates() },
		});

		return steps;
	}
};
