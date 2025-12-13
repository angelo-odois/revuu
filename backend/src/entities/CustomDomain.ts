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

export enum DomainStatus {
  PENDING = "pending",
  ACTIVE = "active",
  ERROR = "error",
}

@Entity("custom_domains")
export class CustomDomain {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", length: 255, unique: true })
  domain!: string;

  @Column({
    type: "enum",
    enum: DomainStatus,
    default: DomainStatus.PENDING,
  })
  status!: DomainStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  verificationToken?: string;

  @Column({ type: "timestamp", nullable: true })
  verifiedAt?: Date;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
