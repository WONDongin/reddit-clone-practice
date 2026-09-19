import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/api";

export default function NewSub() {
  const router = useRouter(); const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { const { data } = await api.post("/api/subs", Object.fromEntries(new FormData(event.currentTarget))); router.push(`/subs/${data.sub.name}`); } catch (error: any) { setMessage(error.response?.data?.message ?? "생성에 실패했습니다."); } };
  return <section className="card"><h1>커뮤니티 만들기</h1><form onSubmit={submit}><input name="name" placeholder="이름 (영문·숫자·_ 3~21자)" required /><input name="title" placeholder="커뮤니티 제목" required /><textarea name="description" placeholder="커뮤니티 소개" /><button>커뮤니티 생성</button></form>{message && <p className="error">{message}</p>}</section>;
}
