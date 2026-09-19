import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) username!: string;
  @Column({ unique: true }) email!: string;
  @Column() password!: string;
  @CreateDateColumn() createdAt!: Date;
  @OneToMany(() => Sub, (sub) => sub.owner) subs!: Sub[];
  @OneToMany(() => Post, (post) => post.author) posts!: Post[];
  @OneToMany(() => Comment, (comment) => comment.author) comments!: Comment[];
  @OneToMany(() => Vote, (vote) => vote.user) votes!: Vote[];
}

@Entity("subs")
export class Sub extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) name!: string;
  @Column() title!: string;
  @Column({ default: "" }) description!: string;
  @CreateDateColumn() createdAt!: Date;
  @ManyToOne(() => User, (user) => user.subs, { onDelete: "CASCADE" }) owner!: User;
  @OneToMany(() => Post, (post) => post.sub) posts!: Post[];
}

@Entity("posts")
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ unique: true }) slug!: string;
  @Column() title!: string;
  @Column({ type: "text", default: "" }) body!: string;
  @Column({ default: 0 }) voteScore!: number;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" }) author!: User;
  @ManyToOne(() => Sub, (sub) => sub.posts, { onDelete: "CASCADE" }) sub!: Sub;
  @OneToMany(() => Comment, (comment) => comment.post) comments!: Comment[];
  @OneToMany(() => Vote, (vote) => vote.post) votes!: Vote[];
}

@Entity("comments")
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "text" }) body!: string;
  @Column({ default: 0 }) voteScore!: number;
  @CreateDateColumn() createdAt!: Date;
  @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" }) author!: User;
  @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" }) post!: Post;
  @OneToMany(() => Vote, (vote) => vote.comment) votes!: Vote[];
}

@Entity("votes")
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "int" }) value!: 1 | -1;
  @CreateDateColumn() createdAt!: Date;
  @ManyToOne(() => User, (user) => user.votes, { onDelete: "CASCADE" }) user!: User;
  @ManyToOne(() => Post, (post) => post.votes, { nullable: true, onDelete: "CASCADE" }) post?: Post;
  @ManyToOne(() => Comment, (comment) => comment.votes, { nullable: true, onDelete: "CASCADE" }) comment?: Comment;
}
