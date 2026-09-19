import type { AppProps } from "next/app";
import Link from "next/link";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return <><header><nav className="nav"><Link href="/"><strong>reddit clone</strong></Link><Link href="/subs/new">커뮤니티 만들기</Link><Link href="/posts/new">글쓰기</Link><Link href="/login">로그인</Link></nav></header><main><Component {...pageProps} /></main></>;
}
