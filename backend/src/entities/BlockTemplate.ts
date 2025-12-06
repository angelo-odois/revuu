import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export interface BlockSchema {
  [key: string]: {
    type: "string" | "richtext" | "image" | "select" | "number" | "boolean" | "color" | "repeater";
    label: string;
    required?: boolean;
    options?: string[];
    default?: unknown;
  };
}

@Entity("block_templates")
export class BlockTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 50 })
  category!: string;

  @Column({ name: "schema_json", type: "jsonb" })
  schemaJSON!: BlockSchema;

  @Column({ name: "preview_data_json", type: "jsonb", nullable: true })
  previewDataJSON?: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
