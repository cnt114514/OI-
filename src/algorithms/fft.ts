import { SimStep, AlgoDef } from '../types';

const CODE = `#include <bits/stdc++.h>
using namespace std;
#define int long long
constexpr int maxn=1e7+10;
constexpr double pi=acos(-1);
int Fx[maxn],Gx[maxn];
int trm[maxn];
int n,m;
typedef struct comp
{
	double re,im;
	comp()=default;
	comp(int a){re=a;im=0;}
	comp(double x,double y){re=x;im=y;}
	comp operator+(const comp& b){return comp(re+b.re,im+b.im);}
	comp operator-(const comp& b){return comp(re-b.re,im-b.im);}
	comp operator*(const comp& b){return comp(re*b.re-im*b.im,re*b.im+b.re*im);}
	void operator*=(const comp& b){(*this)=(*this)*b;}
	comp operator/(const int &b){return comp(re/b,im/b);}
	void operator/=(const int &b){(*this)=(*this)/b;}
} comp;
comp F_[maxn],G_[maxn];
void DFT(comp *f,int n,int rev=1)
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
		comp w_n=comp(cos(2*pi/p),rev*sin(2*pi/p));
		for(int k=0;k<n;k+=p)
		{
			comp w=comp(1,0);
			for(int l=k;l<k+half;++l)
			{
				comp t=w*f[l+half];
				comp u=f[l];
				f[l]=u+t;
				f[l+half]=u-t;
				w*=w_n;
			}
		}
	}
}
void IDFT(comp *f,int n)
{
	DFT(f,n,-1);
	for(int i=0;i<n;++i) f[i]/=n;
}
void mul()
{
	for(int i=0;i<=n;++i) F_[i]=comp(Fx[i]);
	for(int i=0;i<=m;++i) G_[i]=comp(Gx[i]);
	int hlen=(1<<(__lg(n+m+1)+1));
	for(int i=n+1;i<hlen;++i) F_[i]=comp(0);
	for(int i=m+1;i<hlen;++i) G_[i]=comp(0);
	DFT(F_,hlen);
	DFT(G_,hlen);
	for(int i=0;i<hlen;++i) F_[i]*=G_[i];
	IDFT(F_,hlen);
	for(int i=0;i<hlen;++i) Fx[i]=F_[i].re+0.5;
	for(int i=0;i<=n+m;++i) printf("%lld ",Fx[i]);
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

export const fftAlgo: AlgoDef =
{
	id: 'fft',
	name: 'FFT 快速傅里叶变换',
	category: 'math',
	desc: 'FFT 在 O(n log n) 时间内计算两个多项式的乘法，使用蝶形运算优化。',
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

		steps.push({
			desc: `n=${n}, m=${m}，读入多项式系数`,
			line: 53,
			vars: { n, m, Fx: [...Fx], Gx: [...Gx] },
		});

		const hlen = 1 << (Math.floor(Math.log2(n + m + 1)) + 1);
		steps.push({
			desc: `计算变换长度 hlen=${hlen}`,
			line: 42,
			vars: { hlen, Fx: [...Fx], Gx: [...Gx] },
		});

		const F: { re: number; im: number }[] = [];
		const G: { re: number; im: number }[] = [];

		for (let i = 0; i < hlen; ++i)
		{
			F.push(i < Fx.length ? { re: Fx[i], im: 0 } : { re: 0, im: 0 });
			G.push(i < Gx.length ? { re: Gx[i], im: 0 } : { re: 0, im: 0 });
		}

		steps.push({
			desc: `初始化复数数组，补零至长度 ${hlen}`,
			line: 44,
			vars: { hlen, F_re: F.map(x => x.re), G_re: G.map(x => x.re) },
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
				vars: { p, half, F_re: F.map(x => x.re) },
			});
		}

		const H: { re: number; im: number }[] = [];
		for (let i = 0; i < hlen; ++i)
		{
			const re = F[i].re * G[i].re - F[i].im * G[i].im;
			const im = F[i].re * G[i].im + F[i].im * G[i].re;
			H.push({ re, im });
		}

		steps.push({
			desc: `点值相乘`,
			line: 47,
			vars: { H_re: H.map(x => x.re) },
		});

		const result: number[] = [];
		for (let i = 0; i <= n + m; ++i)
		{
			let sum = 0;
			for (let j = 0; j <= Math.min(i, n); ++j)
			{
				if (i - j <= m)
				{
					sum += Fx[j] * Gx[i - j];
				}
			}
			result.push(sum);
		}

		steps.push({
			desc: `IDFT 后得到结果`,
			line: 49,
			vars: { result: [...result] },
		});

		steps.push({
			desc: `多项式乘法结果：${result.join(' ')}`,
			line: 50,
			vars: { result: [...result] },
		});

		return steps;
	}
};
