import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=3e6+10;
constexpr int maxm=2e7+10;
constexpr int maxk=26+26+10+5;
int t,n,q;
char s[maxn];
int convert(char c)
{
	if(c>='a'&&c<='z')
	{
		return c-'a';
	}
	if(c>='A'&&c<='Z')
	{
		return c-'A'+26;
	}
	if(c>='0'&&c<='9')
	{
		return c-'0'+52;
	}
	return -1;
}
int cnt[maxn],ch[maxn][62];
int idx;
void build()
{
	int now=0;
	for(int i=0;s[i];++i)
	{
		int k=convert(s[i]);
		if(k==-1)
		{
			return;
		}
		int &to=ch[now][k];
		if(!to)
		{
			to=++idx;
		}
		now=to;
		++cnt[now];
	}
}
int query()
{
	int now=0;
	for(int i=0;s[i];++i)
	{
		int k=convert(s[i]);
		if(k==-1)
		{
			return 0;
		}
		int &to=ch[now][k];
		if(!to)
		{
			return 0;
		}
		now=to;
	}
	return cnt[now];
}
signed main()
{
	scanf("%lld",&t);
	while(t--)
	{
		scanf("%lld%lld",&n,&q);
		for(int j=0;j<maxk;++j) 
		{
			ch[0][j]=0;
		}
		for(int i=1;i<=n;++i)
		{
			scanf(" %s",s);
			build();
		}
		for(int i=1;i<=q;++i)
		{
			scanf(" %s",s);
			printf("%lld\\n",query());
		}
	}
	return 0;
}`;

const DEFAULT_INPUT = `1
5 3
abc
abcd
abce
abcf
abcg
abc
abcd
abch`;

export const trieAlgo: AlgoDef =
{
	id: 'trie',
	name: 'Trie 字典树',
	category: 'string',
	desc: 'Trie（字典树）用于高效存储和查询字符串集合，支持前缀匹配。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const t = Number(lines[0]);
		let lineIdx = 1;

		const ch: number[][] = Array.from({ length: 1000 }, () => new Array(62).fill(0));
		const cnt: number[] = new Array(1000).fill(0);
		let idx = 0;

		steps.push({
			desc: `t=${t} 组测试数据`,
			line: 50,
			vars: { t, idx, cnt: [...cnt] },
		});

		for (let testCase = 0; testCase < t && lineIdx < lines.length; ++testCase)
		{
			const parts = lines[lineIdx].split(/\s+/).map(Number);
			const n = parts[0];
			const q = parts[1];
			++lineIdx;

			steps.push({
				desc: `测试 ${testCase + 1}：n=${n} 个字符串，q=${q} 个查询`,
				line: 52,
				vars: { n, q, idx, cnt: [...cnt] },
			});

			for (let i = 1; i <= n && lineIdx < lines.length; ++i, ++lineIdx)
			{
				const s = lines[lineIdx];
				let now = 0;
				
				steps.push({
					desc: `开始插入字符串 "${s}"，从根节点 0 出发`,
					line: 33,
					vars: { s, idx, cnt: [...cnt], currentNode: now },
					highlight: [String(now)],
				});
				
				for (let j = 0; j < s.length; ++j)
				{
					const c = s[j];
					let k: number;
					if (c >= 'a' && c <= 'z') k = c.charCodeAt(0) - 'a'.charCodeAt(0);
					else if (c >= 'A' && c <= 'Z') k = c.charCodeAt(0) - 'A'.charCodeAt(0) + 26;
					else if (c >= '0' && c <= '9') k = c.charCodeAt(0) - '0'.charCodeAt(0) + 52;
					else continue;

					if (!ch[now][k])
					{
						ch[now][k] = ++idx;
						steps.push({
							desc: `字符 '${c}'：节点 ${now} 没有该转移，创建新节点 ${idx}`,
							line: 35,
							vars: { s, j, c, now, idx, cnt: [...cnt] },
							highlight: [String(now), String(idx)],
						});
					}
					else
					{
						steps.push({
							desc: `字符 '${c}'：节点 ${now} 已有转移，移动到节点 ${ch[now][k]}`,
							line: 37,
							vars: { s, j, c, now, nextNode: ch[now][k], idx, cnt: [...cnt] },
							highlight: [String(now), String(ch[now][k])],
						});
					}
					now = ch[now][k];
					++cnt[now];
				}
				
				steps.push({
					desc: `字符串 "${s}" 插入完成，最终节点 ${now} 的计数 = ${cnt[now]}`,
					line: 39,
					vars: { s, idx, cnt: [...cnt], finalNode: now },
					highlight: [String(now)],
				});
			}

			steps.push({
				desc: `Trie 构建完成，共 ${idx} 个节点`,
				line: 37,
				vars: { idx, cnt: [...cnt] },
			});

			for (let i = 1; i <= q && lineIdx < lines.length; ++i, ++lineIdx)
			{
				const s = lines[lineIdx];
				let now = 0;
				let found = true;
				const path: number[] = [0];
				
				steps.push({
					desc: `开始查询 "${s}"，从根节点 0 出发`,
					line: 48,
					vars: { s, idx, cnt: [...cnt], currentNode: now, path: [...path] },
					highlight: [String(now)],
				});
				
				for (let j = 0; j < s.length; ++j)
				{
					const c = s[j];
					let k: number;
					if (c >= 'a' && c <= 'z') k = c.charCodeAt(0) - 'a'.charCodeAt(0);
					else if (c >= 'A' && c <= 'Z') k = c.charCodeAt(0) - 'A'.charCodeAt(0) + 26;
					else if (c >= '0' && c <= '9') k = c.charCodeAt(0) - '0'.charCodeAt(0) + 52;
					else 
					{ 
						found = false; 
						steps.push({
							desc: `字符 '${c}' 无效，查询失败`,
							line: 54,
							vars: { s, idx, cnt: [...cnt], currentNode: now, path: [...path], result: 0 },
						});
						break; 
					}

					if (!ch[now][k])
					{
						found = false;
						steps.push({
							desc: `当前节点 ${now} 没有字符 '${c}' 的子节点，查询失败`,
							line: 59,
							vars: { s, idx, cnt: [...cnt], currentNode: now, path: [...path], result: 0, char: c },
							highlight: [String(now)],
						});
						break;
					}
					
					const nextNode = ch[now][k];
					now = nextNode;
					path.push(now);
					
					steps.push({
						desc: `匹配字符 '${c}'，从节点 ${path[path.length - 2]} 移动到节点 ${now}`,
						line: 63,
						vars: { s, idx, cnt: [...cnt], currentNode: now, path: [...path], char: c, charIndex: j },
						highlight: [String(now)],
					});
				}
				
				const result = found ? cnt[now] : 0;
				steps.push({
					desc: `查询完成：${result} 个字符串以 "${s}" 为前缀`,
					line: 65,
					vars: { s, result, idx, cnt: [...cnt], currentNode: now, path: [...path] },
					highlight: found ? [String(now)] : [],
				});
			}
		}

		return steps;
	}
};
