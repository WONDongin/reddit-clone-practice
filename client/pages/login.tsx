import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

export default function Login() {
  const router = useRouter(); const [mode, setMode] = useState<"login" | "register">("login"); const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await api.post(`/api/auth/${mode}`, Object.fromEntries(form)); router.push("/"); } catch (error: any) { setMessage(error.response?.data?.message ?? "요청에 실패했습니다."); } };
  return <section className="card"><h1>{mode === "login" ? "로그인" : "회원가입"}</h1><form onSubmit={submit}><input name="username" placeholder="아이디" required /><input name="email" type="email" placeholder="이메일" required={mode === "register"} /><input name="password" type="password" placeholder="비밀번호" minLength={8} required /><button>{mode === "login" ? "로그인" : "가입하기"}</button></form>{message && <p className="error">{message}</p>}<button className="secondary" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "회원가입으로" : "로그인으로"}</button></section>;
}
