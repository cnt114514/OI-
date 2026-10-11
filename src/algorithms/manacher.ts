import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1.1e7+10;
char s[maxn*2],t[maxn];
int d[maxn*2];
int n;
int l,r;
void init()
{
	int k=0;
	s[0]='$';
	s[++k]='#';
	for(int i=1;t[i];++i)
	{
		s[++k]=t[i];
		s[++k]='#';
	}
	l=r=1;
	d[1]=1;
}
int manachar()
{
	init();
	int res=0;
	for(int i=2;s[i];++i)
	{
		if(i<=r)
		{
			d[i]=min(d[r-i+l],r-i+1);
		}
		else
		{
			d[i]=1;
		}
		while(s[i-d[i]]==s[i+d[i]])
		{
			++d[i];
		}
		if(i+d[i]-1>r)
		{
			l=i-(d[i]-1);
			r=i+(d[i]-1);
		}
		res=max(res,d[i]);
	}
	return res-1;
}
signed main()
{
	scanf(" %s",t+1);
	printf("%lld",manachar());
	return 0;
}`;

const DEFAULT_INPUT = `abababc`;

export const manacherAlgo: AlgoDef =
{
	id: 'manacher',
	name: 'Manacher 最长回文子串',
	category: 'string',
	desc: 'Manacher 算法在 O(n) 时间内求解最长回文子串，利用回文的对称性避免重复计算。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 1) return steps;

		const t = ' ' + lines[0]; // 1-indexed

		steps.push({
			desc: `原串 t="${t.slice(1)}"`,
			line: 42,
			vars: { t: t.slice(1) },
		});

		// 初始化
		const s: string[] = ['$', '#'];
		for (let i = 1; i < t.length; ++i)
		{
			s.push(t[i]);
			s.push('#');
		}
		const sStr = s.join('');

		steps.push({
			desc: `预处理：插入分隔符，得到 "${sStr}"`,
			line: 12,
			vars: { s: sStr },
		});

		const d: number[] = new Array(sStr.length).fill(0);
		d[1] = 1;
		let l = 1, r = 1;

		steps.push({
			desc: `初始化：d[1]=${d[1]}`,
			line: 18,
			vars: { l: 0, r: 0, d: [...d], s: sStr },
		});

		let res = 0;

		for (let i = 2; i < sStr.length; ++i)
		{
			steps.push({
				desc: `【计算 d[${i}]】开始计算位置 ${i} 的回文半径，当前最右回文边界 [${l}, ${r}]`,
				line: 20,
				vars: { i, l, r, d: [...d], s: sStr },
				highlight: [String(i)],
			});

			if (i <= r)
			{
				d[i] = Math.min(d[r - i + l], r - i + 1);
				steps.push({
					desc: `【利用对称性】i=${i} ≤ r=${r}，位置 ${i} 在当前回文内。对称位置 ${r - i + l} 的回文半径为 ${d[r - i + l]}，到右边界的距离 ${r - i + 1}，取最小值：d[${i}]=${d[i]}`,
					line: 22,
					vars: { i, l, r, d: [...d], s: sStr },
					highlight: [String(i), String(r - i + l)],
				});
			}
			else
			{
				d[i] = 1;
				steps.push({
					desc: `【超出边界】i=${i} > r=${r}，位置 ${i} 不在当前回文内，需要从头计算：d[${i}]=1`,
					line: 26,
					vars: { i, l, r, d: [...d], s: sStr },
					highlight: [String(i)],
				});
			}

			while (i - d[i] >= 0 && i + d[i] < sStr.length && sStr[i - d[i]] === sStr[i + d[i]])
			{
				steps.push({
					desc: `【暴力扩展】比较 s[${i - d[i]}]='${sStr[i - d[i]]}' 与 s[${i + d[i]}]='${sStr[i + d[i]]}'，相等，d[${i}]++`,
					line: 28,
					vars: { i, d: [...d], s: sStr },
					highlight: [String(i - d[i]), String(i + d[i])],
				});
				++d[i];
			}

			steps.push({
				desc: `【扩展结束】d[${i}]=${d[i]}，表示以位置 ${i} 为中心的最长回文半径为 ${d[i]}，对应原串回文长度 ${d[i] - 1}`,
				line: 29,
				vars: { i, d: [...d], s: sStr },
				highlight: [String(i)],
			});

			if (i + d[i] - 1 > r)
			{
				l = i - (d[i] - 1);
				r = i + (d[i] - 1);
				steps.push({
					desc: `【更新边界】i+d[i]-1=${i + d[i] - 1} > r=${r}，更新最右回文边界为 [${l}, ${r}]`,
					line: 32,
					vars: { i, l, r, d: [...d], s: sStr },
				});
			}

			res = Math.max(res, d[i]);
		}

		steps.push({
			desc: `最长回文子串长度 = ${res - 1}`,
			line: 37,
			vars: { res: res - 1, d: [...d], s: sStr },
		});

		return steps;
	}
};
