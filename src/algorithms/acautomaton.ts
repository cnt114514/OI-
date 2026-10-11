import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e6+10;
constexpr int maxl=1e6+10;
constexpr int maxk=28;
int n;
int idx;
char s[maxl];
int trie[maxl][maxk];
int nxt[maxl],cnt[maxl];
int cvt(char c)
{
	return c-'a';
}
void build()
{
	int p=0;
	for(int i=0;s[i];++i)
	{
		int k=cvt(s[i]);
		if(!trie[p][k])
		{
			trie[p][k]=++idx;
		}
		p=trie[p][k];
	}
	++cnt[p];
}
void build_AC()
{
	queue<int> q;
	for(int i=0;i<maxk;++i)
	{
		if(trie[0][i])
		{
			q.emplace(trie[0][i]);
		}
	}
	while(!q.empty())
	{
		int u=q.front();
		q.pop();
		for(int i=0;i<maxk;++i)
		{
			int &v=trie[u][i];
			if(v)
			{
				nxt[v]=trie[nxt[u]][i];
				q.emplace(v);
			}
			else
			{
				v=trie[nxt[u]][i];
			}
		}
	}
}
int query()
{
	int res=0;
	for(int i=0,ii=0;s[i];++i)
	{
		int k=cvt(s[i]);
		ii=trie[ii][k];
		for(int jj=ii;jj&&~cnt[jj];jj=nxt[jj])
		{
			res+=cnt[jj];
			cnt[jj]=-1;
		}
	}
	return res;
}
signed main()
{
	scanf("%lld",&n);
	for(int i=1;i<=n;++i)
	{
		scanf(" %s",s);
		build();
	}
	scanf(" %s",s);
	build_AC();
	printf("%lld",query());
}`;

const DEFAULT_INPUT = `5
he
she
her
hers
sher
shersher`;

interface ACNode
{
	id: number;
	children: { char: string; to: number }[];
	fail: number;
	cnt: number;
	depth: number;
}

function buildACNodes(
	idx: number,
	trie: number[][],
	nxt: number[],
	cnt: number[]
): ACNode[]
{
	const nodes: ACNode[] = [];
	const depth: number[] = new Array(idx + 1).fill(0);

	// BFS 计算深度
	const queue: number[] = [0];
	const visited = new Set<number>([0]);
	while (queue.length > 0)
	{
		const u = queue.shift()!;
		for (let c = 0; c < 26; ++c)
		{
			const v = trie[u][c];
			if (v && !visited.has(v))
			{
				visited.add(v);
				depth[v] = depth[u] + 1;
				queue.push(v);
			}
		}
	}

	for (let i = 0; i <= idx; ++i)
	{
		const children: { char: string; to: number }[] = [];
		for (let c = 0; c < 26; ++c)
		{
			if (trie[i][c])
			{
				children.push({ char: String.fromCharCode('a'.charCodeAt(0) + c), to: trie[i][c] });
			}
		}
		nodes.push({ id: i, children, fail: nxt[i], cnt: cnt[i] > 0 ? cnt[i] : 0, depth: depth[i] });
	}
	return nodes;
}

export const acAutomatonAlgo: AlgoDef =
{
	id: 'acautomaton',
	name: 'AC 自动机',
	category: 'string',
	desc: 'AC 自动机（Aho-Corasick）在 Trie 上构建失配指针，实现多模式串匹配。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const n = Number(lines[0]);
		const patterns: string[] = [];

		const trie: number[][] = Array.from({ length: 1000 }, () => new Array(28).fill(0));
		const cnt: number[] = new Array(1000).fill(0);
		let idx = 0;

		steps.push({
			desc: `n=${n} 个模式串`,
			line: 45,
			vars: { n, idx, acNodes: buildACNodes(idx, trie, new Array(1000).fill(0), cnt) },
		});

		for (let i = 1; i <= n && i < lines.length; ++i)
		{
			const s = lines[i];
			patterns.push(s);
			let p = 0;

			steps.push({
				desc: `开始插入模式串 "${s}"`,
				line: 18,
				vars: { s, idx, acNodes: buildACNodes(idx, trie, new Array(1000).fill(0), cnt) },
				highlight: [String(p)],
			});

			for (let j = 0; j < s.length; ++j)
			{
				const k = s.charCodeAt(j) - 'a'.charCodeAt(0);
				const char = s[j];

				if (!trie[p][k])
				{
					trie[p][k] = ++idx;
					steps.push({
						desc: `字符 '${char}'：节点 ${p} 没有该转移，创建新节点 ${idx}`,
						line: 19,
						vars: { s, j, char, p, idx, acNodes: buildACNodes(idx, trie, new Array(1000).fill(0), cnt) },
						highlight: [String(p), String(idx)],
					});
				}
				else
				{
					steps.push({
						desc: `字符 '${char}'：节点 ${p} 已有转移，移动到节点 ${trie[p][k]}`,
						line: 20,
						vars: { s, j, char, p, nextNode: trie[p][k], idx, acNodes: buildACNodes(idx, trie, new Array(1000).fill(0), cnt) },
						highlight: [String(p), String(trie[p][k])],
					});
				}
				p = trie[p][k];
			}
			++cnt[p];
			steps.push({
				desc: `模式串 "${s}" 插入完成，终止节点 ${p} 的 cnt=${cnt[p]}`,
				line: 22,
				vars: { s, p, idx, cnt: [...cnt], acNodes: buildACNodes(idx, trie, new Array(1000).fill(0), cnt) },
				highlight: [String(p)],
			});
		}

		steps.push({
			desc: `Trie 构建完成，共 ${idx} 个节点（不含根）`,
			line: 25,
			vars: { idx, cnt: [...cnt], acNodes: buildACNodes(idx, trie, new Array(1000).fill(0), cnt) },
		});

		const nxt: number[] = new Array(1000).fill(0);
		const queue: number[] = [];

		for (let i = 0; i < 26; ++i)
		{
			if (trie[0][i])
			{
				queue.push(trie[0][i]);
			}
		}

		steps.push({
			desc: `开始 BFS 构建 fail 指针，根节点的子节点入队：[${queue.join(', ')}]`,
			line: 28,
			vars: { idx, queue: [...queue], nxt: [...nxt], acNodes: buildACNodes(idx, trie, nxt, cnt) },
		});

		while (queue.length > 0)
		{
			const u = queue.shift()!;
			steps.push({
				desc: `出队节点 ${u}，处理其所有转移`,
				line: 30,
				vars: { u, queue: [...queue], nxt: [...nxt], acNodes: buildACNodes(idx, trie, nxt, cnt) },
				highlight: [String(u)],
			});

			for (let i = 0; i < 26; ++i)
			{
				const v = trie[u][i];
				const char = String.fromCharCode('a'.charCodeAt(0) + i);
				if (v)
				{
					nxt[v] = trie[nxt[u]][i];
					steps.push({
						desc: `节点 ${u} 有转移 '${char}' → ${v}，设置 fail[${v}]=${nxt[v]}，入队`,
						line: 33,
						vars: { u, v, char, queue: [...queue, v], nxt: [...nxt], acNodes: buildACNodes(idx, trie, nxt, cnt) },
						highlight: [String(u), String(v), String(nxt[v])],
					});
					queue.push(v);
				}
				else
				{
					trie[u][i] = trie[nxt[u]][i];
				}
			}
		}

		steps.push({
			desc: `AC 自动机构建完成，所有 fail 指针已设置`,
			line: 38,
			vars: { idx, nxt: [...nxt], acNodes: buildACNodes(idx, trie, nxt, cnt) },
		});

		if (lines.length > n + 1)
		{
			const text = lines[n + 1];
			steps.push({
				desc: `开始查询文本 "${text}"`,
				line: 47,
				vars: { text, idx, nxt: [...nxt], acNodes: buildACNodes(idx, trie, nxt, cnt) },
			});

			let res = 0;
			let ii = 0;
			for (let i = 0; i < text.length; ++i)
			{
				const k = text.charCodeAt(i) - 'a'.charCodeAt(0);
				const char = text[i];
				ii = trie[ii][k];

				steps.push({
					desc: `字符 '${char}'：当前节点 ${ii}`,
					line: 49,
					vars: { i, char, ii, text, res, acNodes: buildACNodes(idx, trie, nxt, cnt) },
					highlight: [String(ii)],
				});

				for (let jj = ii; jj && cnt[jj] !== -1; jj = nxt[jj])
				{
					res += cnt[jj];
					cnt[jj] = -1;
					steps.push({
						desc: `沿 fail 链：节点 ${jj} 的 cnt=${cnt[jj] + 1}，累加到 res=${res}`,
						line: 51,
						vars: { jj, res, text, acNodes: buildACNodes(idx, trie, nxt, cnt) },
						highlight: [String(jj)],
					});
				}
			}

			steps.push({
				desc: `匹配完成，共 ${res} 个模式串在文本中出现`,
				line: 55,
				vars: { res, text, acNodes: buildACNodes(idx, trie, nxt, cnt) },
			});
		}

		return steps;
	}
};
