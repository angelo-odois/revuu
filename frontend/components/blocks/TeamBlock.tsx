"use client";

import { cn } from "@/lib/utils";
import { Linkedin, Twitter, Github, Mail } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { getValueForDevice, ResponsiveValue, DeviceType } from "@/components/editor/ResponsiveControl";

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  email?: string;
}

interface TeamBlockProps {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
  columns?: 2 | 3 | 4 | string | ResponsiveValue<string>;
  style?: "cards" | "minimal" | "detailed";
  alignment?: "left" | "center" | "right";
}

export function TeamBlock({
  title = "Nossa Equipe",
  subtitle = "Conheca os profissionais por tras do sucesso",
  members = [],
  columns = 3,
  style = "cards",
  alignment = "center",
}: TeamBlockProps) {
  const previewMode = useEditorStore((state) => state.previewMode);
  const resolvedColumns = Number(getValueForDevice(columns, previewMode as DeviceType)) as 2 | 3 | 4;

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const gridCols: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  const defaultMembers: TeamMember[] = [
    {
      name: "Ana Silva",
      role: "CEO & Fundadora",
      image: "https://via.placeholder.com/300x300?text=Ana",
      bio: "Lideranca estrategica com 10+ anos de experiencia",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Carlos Santos",
      role: "Diretor de Tecnologia",
      image: "https://via.placeholder.com/300x300?text=Carlos",
      bio: "Expert em arquitetura de software e inovacao",
      linkedin: "#",
      github: "#",
    },
    {
      name: "Maria Oliveira",
      role: "Designer Principal",
      image: "https://via.placeholder.com/300x300?text=Maria",
      bio: "Criando experiencias digitais memoraveis",
      linkedin: "#",
      twitter: "#",
    },
  ];

  const displayMembers = members.length > 0 ? members : defaultMembers;

  const SocialLinks = ({ member }: { member: TeamMember }) => (
    <div className="flex gap-2 mt-3">
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Linkedin className="h-4 w-4" />
        </a>
      )}
      {member.twitter && (
        <a
          href={member.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Twitter className="h-4 w-4" />
        </a>
      )}
      {member.github && (
        <a
          href={member.github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Github className="h-4 w-4" />
        </a>
      )}
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Mail className="h-4 w-4" />
        </a>
      )}
    </div>
  );

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className={cn("mb-12", alignmentClasses[alignment])}>
            {title && (
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        <div className={cn("grid gap-8", gridCols[resolvedColumns])}>
          {displayMembers.map((member, index) => (
            <div
              key={index}
              className={cn(
                "group",
                style === "cards" && "bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow",
                style === "minimal" && "text-center",
                style === "detailed" && "flex gap-6 items-start"
              )}
            >
              {member.image && (
                <div
                  className={cn(
                    "overflow-hidden",
                    style === "cards" && "aspect-square rounded-lg mb-4",
                    style === "minimal" && "w-32 h-32 rounded-full mx-auto mb-4",
                    style === "detailed" && "w-24 h-24 rounded-lg flex-shrink-0"
                  )}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className={cn(style === "detailed" && "flex-1")}>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
                {member.bio && style !== "minimal" && (
                  <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                )}
                <div className={cn(style === "minimal" && "justify-center flex")}>
                  <SocialLinks member={member} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
