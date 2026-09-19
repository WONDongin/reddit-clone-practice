import "dotenv/config";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { AppDataSource } from "./data-source";
import { Comment, Post, Sub, User, Vote } from "./entities";

type AuthRequest = Request & { user?: User };
const app = express();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? "development-secret";

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

const asyncHandler = (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);

const auth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "로그인이 필요합니다." });
  const payload = jwt.verify(token, jwtSecret) as { userId: number };
  const user = await User.findOneBy({ id: payload.userId });
  if (!user) return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
  req.user = user;
  next();
});

const publicUser = (user: User) => ({ id: user.id, username: user.username, email: user.email, createdAt: user.createdAt });
const slugify = (value: string) => `${value.toLowerCase().trim().replace(/[^a-z0-9가-힣]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const { username, email, password } = req.body as Record<string, string>;
  if (!username || !email || !password) return res.status(400).json({ message: "모든 값을 입력하세요." });
  if (password.length < 8) return res.status(400).json({ message: "비밀번호는 8자 이상이어야 합니다." });
  const exists = await User.findOne({ where: [{ username }, { email }] });
  if (exists) return res.status(409).json({ message: "이미 사용 중인 아이디 또는 이메일입니다." });
  const user = User.create({ username, email, password: await bcrypt.hash(password, 12) });
  await user.save();
  res.status(201).json({ user: publicUser(user) });
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body as Record<string, string>;
  const user = await User.findOneBy({ username });
  if (!user || !(await bcrypt.compare(password ?? "", user.password))) return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "2h" });
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 2 });
  res.json({ user: publicUser(user) });
}));

app.post("/api/auth/logout", (_req, res) => { res.clearCookie("token"); res.status(204).end(); });
app.get("/api/auth/me", auth, (req: AuthRequest, res) => res.json({ user: publicUser(req.user!) }));

app.get("/api/subs", asyncHandler(async (_req, res) => {
  const subs = await Sub.find({ relations: { owner: true }, order: { createdAt: "DESC" } });
  res.json({ subs });
}));

app.post("/api/subs", auth, asyncHandler(async (req, res) => {
  const { name, title, description = "" } = req.body as Record<string, string>;
  if (!/^[a-z0-9_]{3,21}$/i.test(name ?? "")) return res.status(400).json({ message: "커뮤니티 이름은 영문·숫자·밑줄 3~21자만 가능합니다." });
  if (!title) return res.status(400).json({ message: "커뮤니티 제목을 입력하세요." });
  if (await Sub.findOneBy({ name })) return res.status(409).json({ message: "이미 존재하는 커뮤니티입니다." });
  const sub = Sub.create({ name: name.toLowerCase(), title, description, owner: req.user! });
  await sub.save();
  res.status(201).json({ sub });
}));

app.get("/api/subs/:name", asyncHandler(async (req, res) => {
  const name = String(req.params.name).toLowerCase();
  const sub = await Sub.findOne({ where: { name }, relations: { owner: true } });
  if (!sub) return res.status(404).json({ message: "커뮤니티를 찾을 수 없습니다." });
  res.json({ sub });
}));

app.post("/api/subs/:name/images", auth, upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }]), asyncHandler(async (req, res) => {
  const sub = await Sub.findOne({ where: { name: String(req.params.name).toLowerCase() }, relations: { owner: true } });
  if (!sub) return res.status(404).json({ message: "커뮤니티를 찾을 수 없습니다." });
  if (sub.owner.id !== req.user!.id) return res.status(403).json({ message: "커뮤니티 생성자만 이미지를 변경할 수 있습니다." });
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  if (files.image?.[0]) sub.imageUrl = `/uploads/${files.image[0].filename}`;
  if (files.banner?.[0]) sub.bannerUrl = `/uploads/${files.banner[0].filename}`;
  if (!files.image?.[0] && !files.banner?.[0]) return res.status(400).json({ message: "업로드할 이미지를 선택하세요." });
  await sub.save();
  res.json({ sub });
}));

app.get("/api/users/:username", asyncHandler(async (req, res) => {
  const username = String(req.params.username);
  const user = await User.findOneBy({ username });
  if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
  const [posts, comments] = await Promise.all([
    Post.find({ where: { author: { id: user.id } }, relations: { sub: true }, order: { createdAt: "DESC" } }),
    Comment.find({ where: { author: { id: user.id } }, relations: { post: true }, order: { createdAt: "DESC" } }),
  ]);
  res.json({ user: publicUser(user), posts, comments });
}));

app.get("/api/posts", asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page ?? 0), 0);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 30);
  const [posts, total] = await Post.findAndCount({ relations: { author: true, sub: true }, order: { createdAt: "DESC" }, skip: page * limit, take: limit });
  res.json({ posts, page, limit, total, hasNext: (page + 1) * limit < total });
}));

app.post("/api/posts", auth, asyncHandler(async (req, res) => {
  const { subName, title, body = "" } = req.body as Record<string, string>;
  if (!subName || !title?.trim()) return res.status(400).json({ message: "커뮤니티와 제목을 입력하세요." });
  const sub = await Sub.findOneBy({ name: subName.toLowerCase() });
  if (!sub) return res.status(404).json({ message: "커뮤니티를 찾을 수 없습니다." });
  const post = Post.create({ title: title.trim(), body, slug: slugify(title), author: req.user!, sub });
  await post.save();
  res.status(201).json({ post });
}));

app.get("/api/posts/:slug", asyncHandler(async (req, res) => {
  const slug = String(req.params.slug);
  const post = await Post.findOne({ where: { slug }, relations: { author: true, sub: true, comments: { author: true } } });
  if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  post.comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json({ post });
}));

app.post("/api/posts/:slug/comments", auth, asyncHandler(async (req, res) => {
  const body = String(req.body.body ?? "").trim();
  if (!body) return res.status(400).json({ message: "댓글 내용을 입력하세요." });
  const post = await Post.findOneBy({ slug: String(req.params.slug) });
  if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
  const comment = Comment.create({ body, post, author: req.user! });
  await comment.save();
  res.status(201).json({ comment });
}));

app.post("/api/votes", auth, asyncHandler(async (req, res) => {
  const { postId, commentId, value } = req.body as { postId?: number; commentId?: number; value: 1 | -1 };
  if ((postId ? 1 : 0) + (commentId ? 1 : 0) !== 1 || ![1, -1].includes(value)) return res.status(400).json({ message: "올바른 투표 요청이 아닙니다." });
  const target = postId ? await Post.findOneBy({ id: postId }) : await Comment.findOneBy({ id: commentId! });
  if (!target) return res.status(404).json({ message: "대상을 찾을 수 없습니다." });
  const where = postId ? { user: { id: req.user!.id }, post: { id: postId } } : { user: { id: req.user!.id }, comment: { id: commentId! } };
  let vote = await Vote.findOne({ where, relations: { user: true, post: true, comment: true } });
  if (vote?.value === value) { await vote.remove(); target.voteScore -= value; }
  else if (vote) { target.voteScore += value * 2; vote.value = value; await vote.save(); }
  else { vote = Vote.create({ value, user: req.user!, ...(postId ? { post: target as Post } : { comment: target as Comment }) }); await vote.save(); target.voteScore += value; }
  await target.save();
  res.json({ voteScore: target.voteScore, userVote: vote?.value === value ? value : 0 });
}));

app.use((_req, res) => res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." }));
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => { console.error(error); res.status(500).json({ message: "서버 오류가 발생했습니다." }); });

AppDataSource.initialize().then(() => app.listen(port, () => console.log(`API server: http://localhost:${port}`))).catch((error) => { console.error("DB 연결 실패", error); process.exit(1); });
