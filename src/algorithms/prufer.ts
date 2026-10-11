import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e7+10;
vector<int> p,f;
int deg[maxn];
int fa[maxn];
int n,m;
void f_to_p()
{
	for(int i=1,u,v;i<=n-1;++i)
	{
		u=f[i-1];
		v=i;
		fa[v]=u;
		++deg[u];
	}
	int ptr=0;
	for(int i=1;i<=n;++i)
	{
		if(!deg[i])
		{
			ptr=i;
			break;
		}
	}
	int lev=ptr;
	for(int i=1,u;i<=n-2;++i)
	{
		u=fa[lev];
		p.emplace_back(u);
		if(!--deg[u]&&u<ptr)
		{
			lev=u;
		}
		else
		{
			while(deg[++ptr]);
			lev=ptr;
		}
	}
}
void p_to_f()
{
	for(int u:p)
	{
		++deg[u];
	}
	int ptr=0;
	for(int i=1;i<=n;++i)
	{
		if(!deg[i])
		{
			ptr=i;
			break;
		}
	}
	int lev=ptr;
	for(int i=1,v,u;i<=n-2;++i)
	{
		u=p[i-1];
		fa[lev]=u;
		if(!--deg[u]&&u<ptr)
		{
			lev=u;
		}
		else
		{
			while(deg[++ptr]);
			lev=ptr;
		}
	}
	for(int i=1;i<=n-1;++i)
	{
		int tmp=fa[i]?fa[i]:n;
		f.emplace_back(tmp);
	}
}
signed main()
{
	scanf("%lld%lld",&n,&m);
	if(m==1)
	{
		for(int i=1,a;i<=n-1;++i)
		{
			scanf("%lld",&a);
			f.emplace_back(a);
		}
		f_to_p();
		int ans=0;
		for(int i=1;i<=n-2;++i)
		{
			ans^=i*p[i-1];
		}
		printf("%lld",ans);
	}
	else
	{
		for(int i=1,a;i<=n-2;++i)
		{
			scanf("%lld",&a);
			p.emplace_back(a);
		}
		p_to_f();
		int ans=0;
		for(int i=1;i<=n-1;++i)
		{
			ans^=i*f[i-1];
		}
		printf("%lld",ans);
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 1
2 2 4`;

export const pruferAlgo: AlgoDef =
{
	id: 'prufer',
	name: 'Prufer 序列',
	category: 'tree',
	desc: 'Prufer 序列与有标号无根树一一对应。支持树转序列（f_to_p）和序列转树（p_to_f）。',
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
			desc: `n=${n}, m=${m}（1=树转序列，2=序列转树）`,
			line: 63,
			vars: { n, m },
		});

		if (m === 1)
		{
			const f: number[] = [];
			if (lines.length > 1)
			{
				const parts = lines[1].split(/\s+/).map(Number);
				for (const p of parts)
				{
					f.push(p);
				}
			}

			steps.push({
				desc: `读入父亲序列 f=[${f.join(', ')}]`,
				line: 67,
				vars: { f: [...f] },
			});

			const deg: number[] = new Array(n + 1).fill(0);
			const fa: number[] = new Array(n + 1).fill(0);

			for (let i = 1; i <= n - 1; ++i)
			{
				const u = f[i - 1];
				const v = i;
				fa[v] = u;
				++deg[u];
			}

			steps.push({
				desc: `构建树，计算度数`,
				line: 12,
				vars: { fa: [...fa], deg: [...deg] },
			});

			let ptr = 0;
			for (let i = 1; i <= n; ++i)
			{
				if (!deg[i])
				{
					ptr = i;
					break;
				}
			}

			let lev = ptr;
			const p: number[] = [];

			for (let i = 1; i <= n - 2; ++i)
			{
				const u = fa[lev];
				p.push(u);

				steps.push({
					desc: `第 ${i} 步：叶子 ${lev}，父亲 ${u}，加入 Prufer 序列`,
					line: 27,
					vars: { i, lev, u, p: [...p], deg: [...deg], fa: [...fa] },
				});

				--deg[u];
				if (!deg[u] && u < ptr)
				{
					lev = u;
				}
				else
				{
					while (deg[++ptr]);
					lev = ptr;
				}
			}

			steps.push({
				desc: `Prufer 序列 p=[${p.join(', ')}]`,
				line: 73,
				vars: { p },
			});

			let ans = 0;
			for (let i = 1; i <= n - 2; ++i)
			{
				ans ^= i * p[i - 1];
			}

			steps.push({
				desc: `哈希值 = ${ans}`,
				line: 76,
				vars: { ans },
			});
		}
		else
		{
			const p: number[] = [];
			if (lines.length > 1)
			{
				const parts = lines[1].split(/\s+/).map(Number);
				for (const x of parts)
				{
					p.push(x);
				}
			}

			steps.push({
				desc: `读入 Prufer 序列 p=[${p.join(', ')}]`,
				line: 80,
				vars: { p: [...p] },
			});

			const deg: number[] = new Array(n + 1).fill(0);
			for (const u of p)
			{
				++deg[u];
			}

			steps.push({
				desc: `计算度数`,
				line: 44,
				vars: { deg: [...deg] },
			});

			let ptr = 0;
			for (let i = 1; i <= n; ++i)
			{
				if (!deg[i])
				{
					ptr = i;
					break;
				}
			}

			let lev = ptr;
			const fa: number[] = new Array(n + 1).fill(0);

			for (let i = 1; i <= n - 2; ++i)
			{
				const u = p[i - 1];
				fa[lev] = u;

				steps.push({
					desc: `第 ${i} 步：连接叶子 ${lev} 到 ${u}`,
					line: 53,
					vars: { i, lev, u, fa: [...fa], deg: [...deg], p: [...p] },
				});

				--deg[u];
				if (!deg[u] && u < ptr)
				{
					lev = u;
				}
				else
				{
					while (deg[++ptr]);
					lev = ptr;
				}
			}

			const f: number[] = [];
			for (let i = 1; i <= n - 1; ++i)
			{
				f.push(fa[i] ? fa[i] : n);
			}

			steps.push({
				desc: `父亲序列 f=[${f.join(', ')}]`,
				line: 86,
				vars: { f },
			});

			let ans = 0;
			for (let i = 1; i <= n - 1; ++i)
			{
				ans ^= i * f[i - 1];
			}

			steps.push({
				desc: `哈希值 = ${ans}`,
				line: 89,
				vars: { ans },
			});
		}

		return steps;
	}
};
