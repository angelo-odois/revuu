import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User.js";

export enum PageStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export interface BlockContent {
  type: string;
  id: string;
  props: Record<string, unknown>;
}

export interface ContentJSON {
  blocks: BlockContent[];
  meta?: {
    theme?: string;
    [key: string]: unknown;
  };
}

@Entity("pages")
export class Page {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", unique: true, length: 255 })
  slug!: string;

  @Column({ type: "varchar", name: "seo_title", length: 255, nullable: true })
  seoTitle?: string;

  @Column({ type: "text", name: "seo_description", nullable: true })
  seoDescription?: string;

  @Column({ type: "varchar", name: "og_image_url", length: 500, nullable: true })
  ogImageUrl?: string;

  @Column({ name: "content_json", type: "jsonb", default: { blocks: [] } })
  contentJSON!: ContentJSON;

  @Column({
    type: "enum",
    enum: PageStatus,
    default: PageStatus.DRAFT,
  })
  status!: PageStatus;

  @ManyToOne(() => User, (user) => user.pages, { nullable: true })
  @JoinColumn({ name: "created_by" })
  createdBy?: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
