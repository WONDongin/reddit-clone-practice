import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import { api } from "../../lib/api";

const fetcher = (url: string) => api.get(url).then((response) => response.data);

export default function UserPage() {
  const { query } = useRouter();
  const { data, error } = useSWR(query.username ? `/api/users/${query.username}` : null, fetcher);
  if (error) return <p className="error">사용자를 찾을 수 없습니다.</p>;
  if (!data) return <p>불러오는 중...</p>;
  return <><section className="card"><h1>u/{data.user.username}</h1><p className="meta">가입일: {new Date(data.user.createdAt).toLocaleDateString()}</p></section><section className="card"><h2>작성한 게시글</h2>{data.posts.length ? data.posts.map((post: any) => <p key={post.id}><Link href={`/posts/${post.slug}`}>[{post.sub.name}] {post.title}</Link></p>) : <p>작성한 게시글이 없습니다.</p>}</section><section className="card"><h2>작성한 댓글</h2>{data.comments.length ? data.comments.map((comment: any) => <p key={comment.id}><Link href={`/posts/${comment.post.slug}`}>{comment.body}</Link></p>) : <p>작성한 댓글이 없습니다.</p>}</section></>;
}
