import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Comment, Post, Sub, User, Vote } from "./entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  database: process.env.DB_DATABASE ?? "reddit_clone",
  entities: [User, Sub, Post, Comment, Vote],
  // 개발에서는 빠른 실습을 위해 사용하고, 운영에서는 migration으로만 스키마를 변경합니다.
  synchronize: process.env.NODE_ENV !== "production",
  logging: false,
});
