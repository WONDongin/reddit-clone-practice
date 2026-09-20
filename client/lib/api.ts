import axios from "axios";

export const api = axios.create({
  // 운영 환경에서는 빈 값으로 두어 Nginx의 같은 도메인 /api 프록시를 사용합니다.
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
  withCredentials: true,
});
