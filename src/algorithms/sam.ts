import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=2e6+10;
int n;
char s[maxn];
int fa[maxn],len[maxn];
long long ans;
int cnt[maxn];
int tot=1,np=1;
typedef struct edge
{
	int to,nxt;
	edge()=default;
	edge(int a,int b):to(a),nxt(b){}
}edge;
edge es[maxn];
int heads[maxn];
int enums;
void add_edge(int u,int v)
{
	es[++enums]=edge(v,heads[u]);
	heads[u]=enums;
}
map<int,int> ch[maxn];
void extend(int c)
{
	int p=np;
	np=++tot;
	len[np]=len[p]+1;
	cnt[np]=1;
	for(;p&&!ch[p][c];p=fa[p])
	{
		ch[p][c]=np;
	}
	if(!p)
	{
		fa[np]=1;
	}
	else
	{
		int q=ch[p][c];
		if(len[q]==len[p]+1)
		{
			fa[np]=q;
		}
		else
		{
			int nq=++tot;
			len[nq]=len[p]+1;
			fa[nq]=fa[q];
			fa[q]=fa[np]=nq;
			ch[nq]=ch[q];
			for(;p&&ch[p][c]==q;p=fa[p])
			{
				ch[p][c]=nq;
			}
		}
	}
}
void dfs(int u)
{
	for(int i=heads[u];i;i=es[i].nxt)
	{
		int v=es[i].to;
		dfs(v);
		cnt[u]+=cnt[v];
	}
	if(cnt[u]>1)
	{
		ans=max(ans,1ll*cnt[u]*len[u]);
	}
}
signed main()
{
	scanf("%s",s+1);
	for(int i=1;s[i];++i)
	{
		extend(s[i]-'a');
	}
	for(int i=2;i<=tot;++i)
	{
		add_edge(fa[i],i);
	}
	dfs(1);
	printf("%lld",ans);
	return 0;
}`;

const DEFAULT_INPUT = `abab`;

interface SAMNode
{
	id: number;
	len: number;
	fa: number;
	trans: { char: string; to: number }[];
}

function buildSAMNodes(
	tot: number,
	len: number[],
	fa: number[],
	ch: Map<number, number>[]
): SAMNode[]
{
	const nodes: SAMNode[] = [];
	for (let i = 1; i <= tot; ++i)
	{
		const trans: { char: string; to: number }[] = [];
		for (const [c, to] of ch[i].entries())
		{
			trans.push({ char: String.fromCharCode('a'.charCodeAt(0) + c), to });
		}
		nodes.push({ id: i, len: len[i], fa: fa[i], trans });
	}
	return nodes;
}

export const samAlgo: AlgoDef =
{
	id: 'sam',
	name: '后缀自动机 (SAM)',
	category: 'string',
	desc: '后缀自动机（SAM）可以接受字符串的所有后缀，用于求解子串相关问题。每次 extend 操作 O(1) 均摊。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const s = input.trim();
		if (s.length === 0) return steps;

		const n = s.length;

		const fa: number[] = new Array(2 * n + 2).fill(0);
		const len: number[] = new Array(2 * n + 2).fill(0);
		const cnt: number[] = new Array(2 * n + 2).fill(0);
		const ch: Map<number, number>[] = Array.from({ length: 2 * n + 2 }, () => new Map());
		let tot = 1, np = 1;

		steps.push({
			desc: `字符串 s="${s}"，长度 n=${n}，初始化 SAM（只有根节点 1）`,
			line: 62,
			vars: { s, n, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
		});

		for (let i = 0; i < n; ++i)
		{
			const c = s.charCodeAt(i) - 'a'.charCodeAt(0);
			const p = np;
			np = ++tot;
			len[np] = len[p] + 1;
			cnt[np] = 1;

			steps.push({
				desc: `extend('${s[i]}')：新建节点 ${np}，len[${np}]=${len[np]}`,
				line: 32,
				vars: { i, c: s[i], np, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
				highlight: [String(np)],
			});

			let cur = p;
			while (cur && !ch[cur].has(c))
			{
				steps.push({
					desc: `沿 parent 链上行：节点 ${cur} 没有 '${s[i]}' 转移，添加 ${cur} →${s[i]}→ ${np}`,
					line: 36,
					vars: { cur, np, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
					highlight: [String(cur), String(np)],
				});
				ch[cur].set(c, np);
				cur = fa[cur];
			}

			if (!cur)
			{
				fa[np] = 1;
				steps.push({
					desc: `到达根节点，fa[${np}]=1`,
					line: 40,
					vars: { np, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
					highlight: [String(np), '1'],
				});
			}
			else
			{
				const q = ch[cur].get(c)!;
				steps.push({
					desc: `在节点 ${cur} 找到已有转移 '${s[i]}' → ${q}，检查 len[${q}]=${len[q]} vs len[${cur}]+1=${len[cur] + 1}`,
					line: 44,
					vars: { cur, q, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
					highlight: [String(cur), String(q)],
				});

				if (len[q] === len[cur] + 1)
				{
					fa[np] = q;
					steps.push({
						desc: `len[${q}]=${len[q]} == len[${cur}]+1，直接设置 fa[${np}]=${q}`,
						line: 47,
						vars: { np, q, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
						highlight: [String(np), String(q)],
					});
				}
				else
				{
					const nq = ++tot;
					len[nq] = len[cur] + 1;
					fa[nq] = fa[q];
					fa[q] = nq;
					fa[np] = nq;
					ch[nq] = new Map(ch[q]);

					steps.push({
						desc: `len[${q}]=${len[q]} ≠ len[${cur}]+1=${len[cur] + 1}，克隆节点 ${nq}（len=${len[nq]}, fa=${fa[nq]}）`,
						line: 51,
						vars: { nq, q, cur, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
						highlight: [String(nq), String(q)],
					});

					steps.push({
						desc: `重定向：fa[${q}]=${nq}, fa[${np}]=${nq}`,
						line: 54,
						vars: { nq, q, np, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
						highlight: [String(nq), String(q), String(np)],
					});

					let walkP = cur;
					while (walkP && ch[walkP].get(c) === q)
					{
						steps.push({
							desc: `沿 parent 链重定向：节点 ${walkP} 的 '${s[i]}' 转移从 ${q} 改为 ${nq}`,
							line: 58,
							vars: { walkP, nq, q, tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
							highlight: [String(walkP), String(nq)],
						});
						ch[walkP].set(c, nq);
						walkP = fa[walkP];
					}
				}
			}

			steps.push({
				desc: `extend('${s[i]}') 完成，当前 SAM 共 ${tot} 个节点`,
				line: 62,
				vars: { i, c: s[i], tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
			});
		}

		steps.push({
			desc: `SAM 构建完成，共 ${tot} 个节点`,
			line: 65,
			vars: { tot, samNodes: buildSAMNodes(tot, len, fa, ch) },
		});

		// DFS 计算 cnt
		const heads: number[] = new Array(tot + 1).fill(0);
		const es_to: number[] = [0, 0];
		const es_nxt: number[] = [0, 0];
		let enums = 1;

		for (let i = 2; i <= tot; ++i)
		{
			++enums;
			es_to.push(i);
			es_nxt.push(heads[fa[i]]);
			heads[fa[i]] = enums;
		}

		function dfs(u: number)
		{
			for (let i = heads[u]; i; i = es_nxt[i])
			{
				const v = es_to[i];
				dfs(v);
				cnt[u] += cnt[v];
			}
		}

		dfs(1);

		let ans = 0;
		for (let i = 2; i <= tot; ++i)
		{
			if (cnt[i] > 1)
			{
				ans = Math.max(ans, cnt[i] * len[i]);
			}
		}

		steps.push({
			desc: `最长重复子串长度 = ${ans}`,
			line: 68,
			vars: { ans, cnt: cnt.slice(0, tot + 1), samNodes: buildSAMNodes(tot, len, fa, ch) },
		});

		return steps;
	}
};
