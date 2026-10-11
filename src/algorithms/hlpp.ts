import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1.2e3+10;
constexpr int maxm=2*1.2e5+10;
constexpr int INF=(LLONG_MAX>>1)-1ll;
int n,m,s,t;
typedef struct node
{
	int to,w,rev;
	node()=default;
	node(int a,int b,int c):to(a),w(b),rev(c){}
}node;
vector<node> gra[maxn];
int h[maxn],exf[maxn],h_max,gap[maxn];
stack<int> p[maxn];
void add_flow(int u,int v,int c)
{
	gra[u].emplace_back(v,c,gra[v].size());
	gra[v].emplace_back(u,0,gra[u].size()-1);
}
bool bfs()
{
	for(int i=1;i<=n+9;++i) h[i]=INF;
	queue<int> q;
	q.emplace(t);
	h[t]=0;
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		for(auto &ii:gra[u])
		{
			int &v=ii.to;
			int &rev=ii.rev;
			if(!gra[v][rev].w) continue;
			if(h[v]>h[u]+1)
			{
				h[v]=h[u]+1;
				q.emplace(v);
			}
		}
	}
	return h[s]!=INF;
}
bool push(int u)
{
	bool init=(u==s);
	for(auto &ii:gra[u])
	{
		int &w=ii.w;
		if(!w) continue;
		int &v=ii.to;
		if(h[v]==INF) continue;
		if(!init&&h[u]!=h[v]+1) continue;
		if(v!=s&&v!=t&&!exf[v])
		{
			p[h[v]].emplace(v);
			h_max=max(h_max,h[v]);
		}
		int f=init?w:min(w,exf[u]);
		exf[u]-=f;
		exf[v]+=f;
		int &rev=ii.rev;
		w-=f;
		gra[v][rev].w+=f;
		if(!exf[u]) return 0;
	}
	return 1;
}
void relabel(int u)
{
	h[u]=INF;
	for(auto &ii:gra[u])
	{
		if(ii.w) h[u]=min(h[u],h[ii.to]);
	}
	++h[u];
	if(h[u]<n)
	{
		p[h[u]].emplace(u);
		h_max=max(h_max,h[u]);
		++gap[h[u]];
	}
}
int get_hmax()
{
	while(h_max>-1&&p[h_max].empty()) --h_max;
	return h_max==-1?0:p[h_max].top();
}
int hlpp()
{
	if(!bfs()) return 0;
	for(int i=1;i<=n+9;++i) gap[i]=0;
	for(int i=1;i<=n;++i)
	{
		if(h[i]!=INF) ++gap[h[i]];
	}
	h[s]=n;
	push(s);
	int u;
	while((u=get_hmax()))
	{
		p[h_max].pop();
		if(push(u))
		{
			if(!--gap[h[u]])
			{
				for(int i=1;i<=n;++i)
				{
					if(h[i]>h[u]&&i!=s&&h[i]<n+1) h[i]=n+1;
				}
			}
			relabel(u);
		}
	}
	return exf[t];
}
signed main()
{
	scanf("%lld%lld%lld%lld",&n,&m,&s,&t);
	for(int i=1,u,v,c;i<=m;++i)
	{
		scanf("%lld%lld%lld",&u,&v,&c);
		add_flow(u,v,c);
	}
	int maxf=hlpp();
	printf("%lld",maxf);
	return 0;
}`;

const DEFAULT_INPUT = `4 5 1 4
1 2 3
1 3 2
2 3 1
2 4 2
3 4 3`;

export const hlppAlgo: AlgoDef =
{
	id: 'hlpp',
	name: '最大流 HLPP (最高标号预流推进)',
	category: 'graph',
	desc: 'HLPP 算法使用预流推进和最高标号启发式求解最大流，时间复杂度 O(V²√E)。',
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
			desc: `n=${n}, m=${m}, s=${s}, t=${t}`,
			line: 82,
			vars: { n, m, s, t },
		});

		interface Edge
		{
			to: number;
			w: number;
			rev: number;
		}

		const gra: Edge[][] = Array.from({ length: n + 1 }, () => []);
		const origEdges: { from: number; to: number; cap: number; uIdx: number; vIdx: number }[] = [];

		function add_flow(u: number, v: number, c: number)
		{
			const uIdx = gra[u].length;
			const vIdx = gra[v].length;
			gra[u].push({ to: v, w: c, rev: vIdx });
			gra[v].push({ to: u, w: 0, rev: uIdx });
			origEdges.push({ from: u, to: v, cap: c, uIdx, vIdx });
		}

		for (let i = 1; i <= m && i < lines.length; ++i)
		{
			const parts = lines[i].split(/\s+/).map(Number);
			add_flow(parts[0], parts[1], parts[2]);
		}

		function getEdgeStates()
		{
			return origEdges.map(e => ({ from: e.from, to: e.to, cap: e.cap, flow: e.cap - gra[e.from][e.uIdx].w }));
		}

		steps.push({
			desc: `读入 ${m} 条边`,
			line: 86,
			vars: { n, m, s, t, maxf: 0, edgeStates: getEdgeStates() },
		});

		const INF = (Number.MAX_SAFE_INTEGER / 2) - 1;
		const h: number[] = new Array(n + 10).fill(INF);
		const exf: number[] = new Array(n + 10).fill(0);
		const gap: number[] = new Array(n + 10).fill(0);
		const p: number[][] = Array.from({ length: n + 10 }, () => []);
		let h_max = -1;

		function bfs(): boolean
		{
			for (let i = 1; i <= n + 9; ++i) h[i] = INF;
			const queue: number[] = [];
			queue.push(t);
			h[t] = 0;

			while (queue.length > 0)
			{
				const u = queue.shift()!;
				for (const edge of gra[u])
				{
					const v = edge.to;
					const rev = edge.rev;
					if (!gra[v][rev].w) continue;
					if (h[v] > h[u] + 1)
					{
						h[v] = h[u] + 1;
						queue.push(v);
					}
				}
			}
			return h[s] !== INF;
		}

		function push(u: number): boolean
		{
			const init = (u === s);
			for (const edge of gra[u])
			{
				if (!edge.w) continue;
				const v = edge.to;
				if (h[v] === INF) continue;
				if (!init && h[u] !== h[v] + 1) continue;
				if (v !== s && v !== t && !exf[v])
				{
					p[h[v]].push(v);
					h_max = Math.max(h_max, h[v]);
				}
				const f = init ? edge.w : Math.min(edge.w, exf[u]);
				exf[u] -= f;
				exf[v] += f;
				edge.w -= f;
				gra[v][edge.rev].w += f;
				if (!exf[u]) return false;
			}
			return true;
		}

		function relabel(u: number)
		{
			h[u] = INF;
			for (const edge of gra[u])
			{
				if (edge.w) h[u] = Math.min(h[u], h[edge.to]);
			}
			++h[u];
			if (h[u] < n)
			{
				p[h[u]].push(u);
				h_max = Math.max(h_max, h[u]);
				++gap[h[u]];
			}
		}

		function get_hmax(): number
		{
			while (h_max > -1 && p[h_max].length === 0) --h_max;
			return h_max === -1 ? 0 : p[h_max][p[h_max].length - 1];
		}

		if (!bfs())
		{
			steps.push({
				desc: `BFS：无法到达汇点，最大流 = 0`,
				line: 35,
				vars: { maxf: 0, edgeStates: getEdgeStates() },
			});
			return steps;
		}

		const reached: string[] = [];
		for (let i = 1; i <= n; ++i) if (h[i] !== INF) reached.push(String(i));
		steps.push({
			desc: `BFS：构建层次图，h[s]=${h[s]}`,
			line: 35,
			vars: { h: [...h], edgeStates: getEdgeStates() },
			highlight: reached,
		});

		for (let i = 1; i <= n + 9; ++i) gap[i] = 0;
		for (let i = 1; i <= n; ++i)
		{
			if (h[i] !== INF) ++gap[h[i]];
		}
		h[s] = n;
		push(s);

		steps.push({
			desc: `初始化：h[s]=${n}，从源点推送预流`,
			line: 68,
			vars: { h: [...h], exf: [...exf], gap: [...gap], maxf: 0, edgeStates: getEdgeStates() },
		});

		let iter = 0;
		let u: number;
		while ((u = get_hmax()))
		{
			++iter;
			p[h_max].pop();

			steps.push({
				desc: `第 ${iter} 次：处理节点 u=${u}，h_max=${h_max}`,
				line: 73,
				vars: { iter, u, h_max, exf: [...exf], maxf: exf[t], edgeStates: getEdgeStates() },
				highlight: [String(u)],
			});

			if (push(u))
			{
				if (!--gap[h[u]])
				{
					for (let i = 1; i <= n; ++i)
					{
						if (h[i] > h[u] && i !== s && h[i] < n + 1) h[i] = n + 1;
					}
				}
				relabel(u);
			}
		}

		const maxf = exf[t];
		steps.push({
			desc: `最大流 = ${maxf}`,
			line: 80,
			vars: { maxf, exf: [...exf], edgeStates: getEdgeStates() },
		});

		return steps;
	}
};
