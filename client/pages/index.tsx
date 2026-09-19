import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { api } from "../lib/api";

type Post = { id: number; slug: string; title: string; body: string; voteScore: number; createdAt: string; author: { username: string }; sub: { name: string } };
const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function Home() {
  const [page, setPage] = useState(0);
  const { data, error } = useSWR(`/api/posts?page=${page}`, fetcher);
  if (error) return <p className="error">목록을 불러오지 못했습니다. API 서버를 확인하세요.</p>;
  return <><h1>최신 게시글</h1>{data?.posts.map((post: Post) => <article className="card" key={post.id}><p className="meta">r/{post.sub.name} · u/{post.author.username}</p><h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2><p>{post.body}</p><b>▲ {post.voteScore}</b></article>)}<div className="row"><button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>이전</button><button disabled={!data?.hasNext} onClick={() => setPage(page + 1)}>다음</button></div></>;
}
