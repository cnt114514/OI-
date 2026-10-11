import { SimStep, AlgoDef } from '../types';

const CODE = `#include<bits/stdc++.h>
using namespace std;
#define int long long
int n,m;
int a[100010];
int sum[400010];
int lazy[400010];
void pushup(int rt)
{
	sum[rt]=sum[rt<<1]+sum[rt<<1|1];
}
void pushdown(int rt,int ln,int rn)
{
	if(lazy[rt])
	{
		lazy[rt<<1]+=lazy[rt];
		lazy[rt<<1|1]+=lazy[rt];
		sum[rt<<1]+=lazy[rt]*ln;
		sum[rt<<1|1]+=lazy[rt]*rn;
		lazy[rt]=0;
	}
}
void build(int rt,int l,int r)
{
	if(l==r)
	{
		sum[rt]=a[l];
		return;
	}
	int mid=(l+r)>>1;
	build(rt<<1,l,mid);
	build(rt<<1|1,mid+1,r);
	pushup(rt);
}
void update(int rt,int l,int r,int L,int R,int k)
{
	if(L<=l&&r<=R)
	{
		sum[rt]+=k*(r-l+1);
		lazy[rt]+=k;
		return;
	}
	int mid=(l+r)>>1;
	pushdown(rt,mid-l+1,r-mid);
	if(L<=mid) update(rt<<1,l,mid,L,R,k);
	if(R>mid) update(rt<<1|1,mid+1,r,L,R,k);
	pushup(rt);
}
int query(int rt,int l,int r,int L,int R)
{
	if(L<=l&&r<=R) return sum[rt];
	int mid=(l+r)>>1;
	pushdown(rt,mid-l+1,r-mid);
	int ans=0;
	if(L<=mid) ans+=query(rt<<1,l,mid,L,R);
	if(R>mid) ans+=query(rt<<1|1,mid+1,r,L,R);
	return ans;
}
signed main()
{
	scanf("%lld%lld",&n,&m);
	for(int i=1;i<=n;++i)
	{
		scanf("%lld",&a[i]);
	}
	build(1,1,n);
	for(int i=1;i<=m;++i)
	{
		int op;
		scanf("%lld",&op);
		if(op==1)
		{
			int l,r,k;
			scanf("%lld%lld%lld",&l,&r,&k);
			update(1,1,n,l,r,k);
		}
		else
		{
			int l,r;
			scanf("%lld%lld",&l,&r);
			printf("%lld\\n",query(1,1,n,l,r));
		}
	}
	return 0;
}`;

const DEFAULT_INPUT = `5 5
1 2 3 4 5
1 1 3 2
2 2 5
1 3 5 1
2 1 5
2 3 4`;

export const segTreeAlgo: AlgoDef =
{
	id: 'segtree',
	name: '线段树 (Segment Tree)',
	category: 'tree',
	desc: '支持区间加、区间求和的线段树。使用 lazy 标记实现 O(log n) 的区间操作。',
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

		const a: number[] = new Array(n + 1).fill(0);
		const sum: number[] = new Array(4 * n + 4).fill(0);
		const lazy: number[] = new Array(4 * n + 4).fill(0);

		function pushup(rt: number)
		{
			sum[rt] = sum[rt << 1] + sum[rt << 1 | 1];
		}

		function pushdown(rt: number, ln: number, rn: number)
		{
			if (lazy[rt])
			{
				lazy[rt << 1] += lazy[rt];
				lazy[rt << 1 | 1] += lazy[rt];
				sum[rt << 1] += lazy[rt] * ln;
				sum[rt << 1 | 1] += lazy[rt] * rn;
				lazy[rt] = 0;
			}
		}

		function build(rt: number, l: number, r: number)
		{
			if (l === r)
			{
				sum[rt] = a[l];
				return;
			}
			const mid = (l + r) >> 1;
			build(rt << 1, l, mid);
			build(rt << 1 | 1, mid + 1, r);
			pushup(rt);
		}

		function update(rt: number, l: number, r: number, L: number, R: number, k: number)
		{
			if (L <= l && r <= R)
			{
				sum[rt] += k * (r - l + 1);
				lazy[rt] += k;
				return;
			}
			const mid = (l + r) >> 1;
			pushdown(rt, mid - l + 1, r - mid);
			if (L <= mid) update(rt << 1, l, mid, L, R, k);
			if (R > mid) update(rt << 1 | 1, mid + 1, r, L, R, k);
			pushup(rt);
		}

		function query(rt: number, l: number, r: number, L: number, R: number): number
		{
			if (L <= l && r <= R) return sum[rt];
			const mid = (l + r) >> 1;
			pushdown(rt, mid - l + 1, r - mid);
			let ans = 0;
			if (L <= mid) ans += query(rt << 1, l, mid, L, R);
			if (R > mid) ans += query(rt << 1 | 1, mid + 1, r, L, R);
			return ans;
		}

		steps.push({
			desc: `初始化：n=${n}, m=${m}`,
			line: 67,
			vars: { n, m },
		});

		// 读入数组
		if (lines.length > 1)
		{
			const initArr = lines[1].split(/\s+/).map(Number);
			for (let i = 0; i < initArr.length && i < n; ++i)
			{
				a[i + 1] = initArr[i];
			}
			steps.push({
				desc: `读入数组 a = [${initArr.join(', ')}]`,
				line: 70,
				vars: { a: [...a] },
			});
		}

		// 建树
		build(1, 1, n);
		const treeSnapshot = sum.slice(0, 4 * n + 4);
		steps.push({
			desc: `建树完成，sum[1]=${sum[1]}`,
			line: 73,
			vars: { sum: treeSnapshot, lazy: [...lazy], n },
		});

		// 处理操作
		let lineIdx = 2;
		for (let i = 1; i <= m && lineIdx < lines.length; ++i, ++lineIdx)
		{
			const parts = lines[lineIdx].split(/\s+/).map(Number);
			const op = parts[0];

			if (op === 1)
			{
				const l = parts[1], r = parts[2], k = parts[3];
				update(1, 1, n, l, r, k);
				steps.push({
					desc: `操作 1：区间 [${l},${r}] 加 ${k}`,
					line: 79,
					vars: { n, op, l, r, k, sum: [...sum], lazy: [...lazy] },
				});
			}
			else
			{
				const l = parts[1], r = parts[2];
				const ans = query(1, 1, n, l, r);
				steps.push({
					desc: `操作 2：query(${l}, ${r}) = ${ans}`,
					line: 84,
					vars: { n, op, l, r, ans, sum: [...sum] },
				});
			}
		}

		steps.push({
			desc: '所有操作执行完毕',
			line: 88,
			vars: { n, sum: [...sum], lazy: [...lazy] },
		});

		return steps;
	}
};
