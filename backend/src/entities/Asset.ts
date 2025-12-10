import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./User.js";

@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  filename!: string;

  @Column({ type: "varchar", length: 500 })
  url!: string;

  @Column({ type: "varchar", name: "mime_type", length: 100 })
  mimeType!: string;

  @Column({ type: "bigint" })
  size!: number;

  @Column({ type: "varchar", name: "thumbnail_url", length: 500, nullable: true })
  thumbnailUrl?: string;

  @ManyToOne("User", "assets", { nullable: true })
  @JoinColumn({ name: "uploaded_by" })
  uploadedBy?: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
