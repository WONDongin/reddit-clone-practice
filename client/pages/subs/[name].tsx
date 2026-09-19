import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import { api } from "../../lib/api";
const fetcher = (url: string) => api.get(url).then((r) => r.data);
export default function SubDetail() { const { query } = useRouter(); const { data, error } = useSWR(query.name ? `/api/subs/${query.name}` : null, fetcher); if (error) return <p className="error">커뮤니티를 찾을 수 없습니다.</p>; if (!data) return <p>불러오는 중...</p>; return <section className="card"><h1>r/{data.sub.name}</h1><h2>{data.sub.title}</h2><p>{data.sub.description || "소개가 없습니다."}</p><p className="meta">생성자: u/{data.sub.owner.username}</p><Link href={`/posts/new?sub=${data.sub.name}`}>이 커뮤니티에 글쓰기</Link></section>; }
