import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
constexpr int maxt=1e6+10;
constexpr int maxs=maxt<<1;
constexpr int maxk=26;
int n;
char s[maxt];
long long ans;
typedef struct edge
{
	int to,nxt,c;
	edge()=default;
	edge(int x,int y,int z):to(x),nxt(y),c(z){}
}edge;
edge es[maxt];
int heads[maxt];
int enums;
void add_edge(int x,int y,int w)
{
	es[++enums]=edge(y,heads[x],w);
	heads[x]=enums;
}
int tots;
int chs[maxs][maxk];
int fa[maxs];
int len[maxs];
int samid[maxt];
int GSAM_extend(int p,int c)
{
	int np=++tots;
	len[np]=len[p]+1;
	for(;p&&!chs[p][c];p=fa[p])
	{
		chs[p][c]=np;
	}
	if(!p)
	{
		fa[np]=1;
	}
	else
	{
		int q=chs[p][c];
		if(len[q]==len[p]+1)
		{
			fa[np]=q;
		}
		else
		{
			int nq=++tots;
			len[nq]=len[p]+1;
			fa[nq]=fa[q];
			fa[q]=nq;
			fa[np]=nq;
			for(int i=0;i<26;++i)
			{
				chs[nq][i]=chs[q][i];
			}
			for(;p&&chs[p][c]==q;p=fa[p])
			{
				chs[p][c]=nq;
			}
		}
	}
	return np;
}
void build_GSAM()
{
	tots=1;
	int* q=(int*)malloc(maxt*sizeof(int));
	int top=0,tail=0;
	q[tail]=0;
	++tail;
	samid[0]=1;
	while(top<tail)
	{
		int u=q[top];
		++top;
		for(int i=heads[u];i;i=es[i].nxt)
		{
			int v=es[i].to;
			int c=es[i].c;
			samid[v]=GSAM_extend(samid[u],c);
			q[tail]=v;
			++tail;
		}
	}
}
signed main()
{
	scanf("%lld",&n);
	for(int i=1;i<=n;++i)
	{
		scanf(" %s",s+1);
		int p=0;
		for(int j=1;s[j];++j)
		{
			int k=s[j]-'a';
			int to=0;
			for(int e=heads[p];e;e=es[e].nxt)
			{
				if(es[e].c==k)
				{
					to=es[e].to;
					break;
				}
			}
			if(!to)
			{
				to=++tots;
				add_edge(p,to,k);
			}
			p=to;
		}
	}
	build_GSAM();
	for(int i=2;i<=tots;++i)
	{
		ans+=len[i]-len[fa[i]];
	}
	printf("%lld",ans);
	return 0;
}`;

const DEFAULT_INPUT = `3
abc
ab
bc`;

interface GSAMNode
{
	id: number;
	len: number;
	fa: number;
	trans: { char: string; to: number }[];
}

function buildGSAMNodes(
	tots: number,
	len: number[],
	fa: number[],
	chs: number[][]
): GSAMNode[]
{
	const nodes: GSAMNode[] = [];
	for (let i = 1; i <= tots; ++i)
	{
		const trans: { char: string; to: number }[] = [];
		for (let c = 0; c < 26; ++c)
		{
			if (chs[i][c])
			{
				trans.push({ char: String.fromCharCode('a'.charCodeAt(0) + c), to: chs[i][c] });
			}
		}
		nodes.push({ id: i, len: len[i], fa: fa[i], trans });
	}
	return nodes;
}

export const gsamAlgo: AlgoDef =
{
	id: 'gsam',
	name: '广义后缀自动机 (GSAM)',
	category: 'string',
	desc: '广义后缀自动机可以处理多个字符串的子串问题。先建 Trie，再在 Trie 上构建 SAM。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		const strings: string[] = [];

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			strings.push(lines[i]);
		}

		steps.push({
			desc: `n=${n} 个字符串：${strings.map(s => `"${s}"`).join(', ')}`,
			line: 68,
			vars: { n, strings, tots: 0, len: [0], fa: [0], gsamNodes: [] },
		});

		// Build Trie
		const trie: Map<number, Map<number, number>> = new Map();
		trie.set(0, new Map());
		let trie_tot = 0;

		for (const str of strings)
		{
			let p = 0;
			steps.push({
				desc: `开始插入字符串 "${str}" 到 Trie`,
				line: 72,
				vars: { str, trie_tot, tots: 0, len: [0], fa: [0], gsamNodes: [] },
				highlight: [String(p)],
			});

			for (let j = 0; j < str.length; ++j)
			{
				const c = str.charCodeAt(j) - 'a'.charCodeAt(0);
				const char = str[j];
				if (!trie.has(p)) trie.set(p, new Map());
				const pMap = trie.get(p)!;

				if (!pMap.has(c))
				{
					++trie_tot;
					trie.set(trie_tot, new Map());
					pMap.set(c, trie_tot);
					steps.push({
						desc: `字符 '${char}'：Trie 节点 ${p} 没有该转移，创建新节点 ${trie_tot}`,
						line: 73,
						vars: { str, j, char, p, trie_tot, tots: 0, len: [0], fa: [0], gsamNodes: [] },
						highlight: [String(p), String(trie_tot)],
					});
				}
				else
				{
					steps.push({
						desc: `字符 '${char}'：Trie 节点 ${p} 已有转移，移动到节点 ${pMap.get(c)!}`,
						line: 74,
						vars: { str, j, char, p, nextNode: pMap.get(c)!, trie_tot, tots: 0, len: [0], fa: [0], gsamNodes: [] },
						highlight: [String(p), String(pMap.get(c)!)],
					});
				}
				p = pMap.get(c)!;
			}
		}

		steps.push({
			desc: `Trie 构建完成，共 ${trie_tot} 个节点`,
			line: 75,
			vars: { trie_tot, strings, tots: 0, len: [0], fa: [0], gsamNodes: [] },
		});

		// Build GSAM
		const chs: number[][] = Array.from({ length: 2 * trie_tot + 2 }, () => new Array(26).fill(0));
		const fa: number[] = new Array(2 * trie_tot + 2).fill(0);
		const len: number[] = new Array(2 * trie_tot + 2).fill(0);
		let tots = 1;

		function gsam_extend(p: number, c: number): number
		{
			const np = ++tots;
			len[np] = len[p] + 1;

			steps.push({
				desc: `gsam_extend(${p}, '${String.fromCharCode('a'.charCodeAt(0) + c)}')：新建节点 ${np}，len[${np}]=${len[np]}`,
				line: 35,
				vars: { p, c: String.fromCharCode('a'.charCodeAt(0) + c), np, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
				highlight: [String(np)],
			});

			let cur = p;
			while (cur && !chs[cur][c])
			{
				steps.push({
					desc: `沿 parent 链上行：节点 ${cur} 没有转移 '${String.fromCharCode('a'.charCodeAt(0) + c)}'，添加 ${cur} → ${np}`,
					line: 37,
					vars: { cur, np, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
					highlight: [String(cur), String(np)],
				});
				chs[cur][c] = np;
				cur = fa[cur];
			}

			if (!cur)
			{
				fa[np] = 1;
				steps.push({
					desc: `到达根节点，fa[${np}]=1`,
					line: 40,
					vars: { np, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
					highlight: [String(np), '1'],
				});
			}
			else
			{
				const q = chs[cur][c];
				steps.push({
					desc: `在节点 ${cur} 找到已有转移 → ${q}，检查 len[${q}]=${len[q]} vs len[${cur}]+1=${len[cur] + 1}`,
					line: 44,
					vars: { cur, q, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
					highlight: [String(cur), String(q)],
				});

				if (len[q] === len[cur] + 1)
				{
					fa[np] = q;
					steps.push({
						desc: `len[${q}]=${len[q]} == len[${cur}]+1，直接设置 fa[${np}]=${q}`,
						line: 47,
						vars: { np, q, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
						highlight: [String(np), String(q)],
					});
				}
				else
				{
					const nq = ++tots;
					len[nq] = len[cur] + 1;
					fa[nq] = fa[q];
					fa[q] = nq;
					fa[np] = nq;
					for (let i = 0; i < 26; ++i)
					{
						chs[nq][i] = chs[q][i];
					}

					steps.push({
						desc: `len[${q}]=${len[q]} ≠ len[${cur}]+1=${len[cur] + 1}，克隆节点 ${nq}`,
						line: 51,
						vars: { nq, q, cur, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
						highlight: [String(nq), String(q)],
					});

					steps.push({
						desc: `重定向：fa[${q}]=${nq}, fa[${np}]=${nq}`,
						line: 54,
						vars: { nq, q, np, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
						highlight: [String(nq), String(q), String(np)],
					});

					let walkP = cur;
					while (walkP && chs[walkP][c] === q)
					{
						steps.push({
							desc: `沿 parent 链重定向：节点 ${walkP} 的转移从 ${q} 改为 ${nq}`,
							line: 58,
							vars: { walkP, nq, q, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
							highlight: [String(walkP), String(nq)],
						});
						chs[walkP][c] = nq;
						walkP = fa[walkP];
					}
				}
			}
			return np;
		}

		const samid: number[] = new Array(trie_tot + 1).fill(0);
		const queue: number[] = [];
		queue.push(0);
		samid[0] = 1;

		steps.push({
			desc: `开始 BFS 构建 GSAM，初始队列包含 Trie 根节点`,
			line: 78,
			vars: { queue: [...queue], tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
		});

		while (queue.length > 0)
		{
			const u = queue.shift()!;
			steps.push({
				desc: `出队 Trie 节点 ${u}，对应 GSAM 节点 ${samid[u]}`,
				line: 79,
				vars: { u, samid_u: samid[u], queue: [...queue], tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
				highlight: [String(u), String(samid[u])],
			});

			if (trie.has(u))
			{
				for (const [c, v] of trie.get(u)!.entries())
				{
					const char = String.fromCharCode('a'.charCodeAt(0) + c);
					steps.push({
						desc: `处理 Trie 转移 '${char}'：${u} → ${v}，调用 gsam_extend(${samid[u]}, '${char}')`,
						line: 80,
						vars: { u, v, c: char, samid_u: samid[u], tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
						highlight: [String(u), String(v)],
					});

					samid[v] = gsam_extend(samid[u], c);

					steps.push({
						desc: `gsam_extend 返回 ${samid[v]}，设置 samid[${v}]=${samid[v]}，入队`,
						line: 81,
						vars: { v, samid_v: samid[v], queue: [...queue, v], tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
						highlight: [String(v), String(samid[v])],
					});

					queue.push(v);
				}
			}
		}

		steps.push({
			desc: `GSAM 构建完成，共 ${tots} 个节点`,
			line: 85,
			vars: { tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
		});

		let ans = 0;
		for (let i = 2; i <= tots; ++i)
		{
			ans += len[i] - len[fa[i]];
		}

		steps.push({
			desc: `不同子串数 = ${ans}`,
			line: 88,
			vars: { ans, tots, len: len.slice(0, tots + 1), fa: fa.slice(0, tots + 1), gsamNodes: buildGSAMNodes(tots, len, fa, chs) },
		});

		return steps;
	}
};
