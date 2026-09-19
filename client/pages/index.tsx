import Link from "next/link";
import { useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { api } from "../lib/api";

type Post = { id: number; slug: string; title: string; body: string; voteScore: number; createdAt: string; author: { username: string }; sub: { name: string } };
const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function Home() {
  const { data, error, size, setSize, isValidating } = useSWRInfinite((page) => `/api/posts?page=${page}&limit=10`, fetcher);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const posts = data?.flatMap((page) => page.posts) ?? [];
  const hasNext = data?.[data.length - 1]?.hasNext ?? false;
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNext) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isValidating) setSize((current) => current + 1);
    }, { rootMargin: "160px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNext, isValidating, setSize]);
  if (error) return <p className="error">목록을 불러오지 못했습니다. API 서버를 확인하세요.</p>;
  return <><h1>최신 게시글</h1>{posts.map((post: Post) => <article className="card" key={post.id}><p className="meta">r/{post.sub.name} · <Link href={`/users/${post.author.username}`}>u/{post.author.username}</Link></p><h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2><p>{post.body}</p><b>▲ {post.voteScore}</b></article>)}<div ref={loadMoreRef} className="card">{isValidating ? "게시글을 불러오는 중..." : hasNext ? "아래로 스크롤하면 더 불러옵니다." : "마지막 게시글입니다."}</div></>;
}
