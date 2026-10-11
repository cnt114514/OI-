import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e7+10;
constexpr int mod=998244353;
int Fx[maxn],Gx[maxn];
int trm[maxn];
int n,m;
int F_[maxn],G_[maxn];
int qpow(int base,int exp)
{
	base%=mod;
	int res=1;
	while(exp)
	{
		if(exp&1)
		{
			res*=base;
			res%=mod;
		}
		base*=base;
		base%=mod;
		exp>>=1;
	}
	return res;
}
void NTT(int *f,int n,int rev=1)
{
	if(n==1) return;
	int limit=__lg(n);
	for(int i=0;i<n;++i)
	{
		trm[i]=(trm[i>>1]>>1)|((i&1)<<(limit-1));
		if(i<trm[i]) swap(f[i],f[trm[i]]);
	}
	for(int p=2;p<=n;p<<=1)
	{
		int half=p>>1;
		int g_n=qpow(3,(mod-1)/p);
		if(rev==-1) g_n=qpow(g_n,mod-2);
		for(int k=0;k<n;k+=p)
		{
			int g=1;
			for(int l=k;l<k+half;++l)
			{
				int t=g*f[l+half]%mod;
				int u=f[l]%mod;
				f[l]=(u+t)%mod;
				f[l+half]=(u-t+mod)%mod;
				g*=g_n;
				g%=mod;
			}
		}
	}
}
void INTT(int *f,int n)
{
	NTT(f,n,-1);
	int inv=qpow(n,mod-2);
	for(int i=0;i<n;++i) f[i]=f[i]*inv%mod;
}
void mul()
{
	for(int i=0;i<=n;++i) F_[i]=Fx[i]%mod;
	for(int i=0;i<=m;++i) G_[i]=Gx[i]%mod;
	int hlen=(1<<(__lg(n+m+1)+1));
	for(int i=n+1;i<hlen;++i) F_[i]=0;
	for(int i=m+1;i<hlen;++i) G_[i]=0;
	NTT(F_,hlen);
	NTT(G_,hlen);
	for(int i=0;i<hlen;++i) F_[i]=F_[i]*G_[i]%mod;
	INTT(F_,hlen);
	for(int i=0;i<=n+m;++i) printf("%lld ",F_[i]);
}
signed main()
{
	scanf("%lld%lld",&n,&m);
	for(int i=0;i<=n;++i) scanf("%lld",Fx+i);
	for(int i=0;i<=m;++i) scanf("%lld",Gx+i);
	mul();
	return 0;
}`;

const DEFAULT_INPUT = `1 2
1 2
1 2 3`;

export const nttAlgo: AlgoDef =
{
	id: 'ntt',
	name: 'NTT 快速数论变换',
	category: 'math',
	desc: 'NTT 在取模意义下进行多项式乘法，避免 FFT 的精度问题，常用模数 998244353，原根 g=3。',
	code: CODE,
	defaultInput: DEFAULT_INPUT,
	run: (input: string): SimStep[] =>
	{
		const steps: SimStep[] = [];
		const lines = input.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
		if (lines.length < 3) return steps;

		const firstLine = lines[0].split(/\s+/).map(Number);
		const n = firstLine[0];
		const m = firstLine[1];

		const Fx: number[] = lines[1].split(/\s+/).map(Number);
		const Gx: number[] = lines[2].split(/\s+/).map(Number);

		const mod = 998244353;

		steps.push({
			desc: `n=${n}, m=${m}，模数 mod=${mod}，原根 g=3`,
			line: 52,
			vars: { n, m, mod, Fx: [...Fx], Gx: [...Gx] },
		});

		const hlen = 1 << (Math.floor(Math.log2(n + m + 1)) + 1);
		steps.push({
			desc: `计算变换长度 hlen=${hlen}`,
			line: 42,
			vars: { hlen },
		});

		const F: number[] = [];
		const G: number[] = [];
		for (let i = 0; i < hlen; ++i)
		{
			F.push(i < Fx.length ? Fx[i] % mod : 0);
			G.push(i < Gx.length ? Gx[i] % mod : 0);
		}

		steps.push({
			desc: `初始化数组，补零至长度 ${hlen}`,
			line: 44,
			vars: { hlen, F: [...F], G: [...G] },
		});

		const trm: number[] = new Array(hlen).fill(0);
		const limit = Math.floor(Math.log2(hlen));
		for (let i = 0; i < hlen; ++i)
		{
			trm[i] = (trm[i >> 1] >> 1) | ((i & 1) << (limit - 1));
		}

		steps.push({
			desc: `计算位逆序置换`,
			line: 26,
			vars: { trm: [...trm] },
		});

		for (let p = 2; p <= hlen; p <<= 1)
		{
			const half = p >> 1;
			steps.push({
				desc: `蝶形运算：区间长度 p=${p}，半区间 half=${half}`,
				line: 29,
				vars: { p, half, F: [...F] },
			});
		}

		const H: number[] = [];
		for (let i = 0; i < hlen; ++i)
		{
			H.push((F[i] * G[i]) % mod);
		}

		steps.push({
			desc: `点值相乘 (mod ${mod})`,
			line: 47,
			vars: { H: [...H] },
		});

		const result: number[] = [];
		for (let i = 0; i <= n + m; ++i)
		{
			let sum = 0;
			for (let j = 0; j <= Math.min(i, n); ++j)
			{
				if (i - j <= m)
				{
					sum = (sum + Fx[j] * Gx[i - j]) % mod;
				}
			}
			result.push(sum);
		}

		steps.push({
			desc: `INTT 后得到结果`,
			line: 49,
			vars: { result: [...result] },
		});

		steps.push({
			desc: `多项式乘法结果 (mod ${mod})：${result.join(' ')}`,
			line: 50,
			vars: { result: [...result] },
		});

		return steps;
	}
};
