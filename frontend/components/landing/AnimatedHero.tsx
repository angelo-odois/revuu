"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Star, Play, Layout, FileText,
  Code2, Users, Briefcase
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const editorVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1,
      delay: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const blockVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 1.2 + i * 0.2,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

const typewriterTexts = [
  "Desenvolvedor Full Stack",
  "Designer UX/UI",
  "Product Manager",
  "Engenheiro de Software",
  "Data Scientist",
];

export function AnimatedHero() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = typewriterTexts[currentTextIndex];
    const typingSpeed = isDeleting ? 30 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % typewriterTexts.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex]);

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-10 px-6 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute left-1/4 top-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/20 blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-1/4 bottom-1/4 w-[350px] h-[350px] rounded-full bg-orange-500/15 blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-5xl mx-auto w-full text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Novo: Templates de Portfolio para 2025
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
          >
            Crie seu portfólio
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              em minutos
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
          >
            A plataforma mais fácil para criar portfólios profissionais.
            <span className="text-foreground font-medium"> Sem código</span>,
            totalmente personalizável e pronto para impressionar recrutadores.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/admin/register"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-full font-medium overflow-hidden transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105"
            >
              <span className="relative z-10">Criar Meu Portfólio Grátis</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            <Link
              href="#como-funciona"
              className="inline-flex items-center gap-2 px-6 py-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play className="h-5 w-5" />
              </motion.div>
              Ver como funciona
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={itemVariants}
            className="pt-8 flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: 1.3 + i * 0.1, duration: 0.4 }}
                  >
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  </motion.div>
                ))}
              </div>
              <span>
                Usado por <strong className="text-foreground">+2.500</strong>{" "}
                profissionais
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Editor Preview */}
        <motion.div
          variants={editorVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-xl border border-border/50 shadow-2xl shadow-amber-500/10 overflow-hidden bg-card">
            {/* Browser Chrome */}
            <div className="h-10 bg-muted/50 flex items-center gap-2 px-4 border-b border-border/50">
              <div className="flex gap-1.5">
                <motion.div
                  className="w-3 h-3 rounded-full bg-red-500/80"
                  whileHover={{ scale: 1.2 }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-yellow-500/80"
                  whileHover={{ scale: 1.2 }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-green-500/80"
                  whileHover={{ scale: 1.2 }}
                />
              </div>
              <div className="flex-1 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="px-4 py-1.5 bg-background rounded-lg text-xs text-muted-foreground border border-border/50"
                >
                  revuu.com.br/seu-portfolio
                </motion.div>
              </div>
            </div>

            {/* Editor Interface */}
            <div className="flex h-[480px] bg-background">
              {/* Left Sidebar - Blocks */}
              <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="w-16 bg-muted/30 border-r border-border/50 p-2 flex flex-col gap-2"
              >
                {[
                  { icon: Layout, active: true },
                  { icon: FileText, active: false },
                  { icon: Code2, active: false },
                  { icon: Users, active: false },
                  { icon: Briefcase, active: false },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + i * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                    className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                      item.active
                        ? "bg-amber-500/20 border border-amber-500/30"
                        : "bg-muted/50 border border-border/50 hover:bg-muted"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        item.active ? "text-amber-500" : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Center - Canvas */}
              <div className="flex-1 bg-muted/10 p-6 overflow-hidden">
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Hero Block - Selected */}
                  <motion.div
                    custom={0}
                    variants={blockVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative group"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6 }}
                      className="absolute -left-8 top-1/2 -translate-y-1/2"
                    >
                      <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center cursor-grab">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      </div>
                    </motion.div>
                    <motion.div
                      className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/50 rounded-xl"
                      animate={{
                        borderColor: ["rgba(245,158,11,0.5)", "rgba(245,158,11,0.8)", "rgba(245,158,11,0.5)"],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      <div className="h-8 bg-foreground/80 rounded w-48 mb-2" />
                      <div className="h-5 rounded w-64 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={currentTextIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-muted-foreground text-sm block"
                          >
                            {displayText}
                            <motion.span
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="inline-block w-0.5 h-4 bg-amber-500 ml-0.5 align-middle"
                            />
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* About Block */}
                  <motion.div
                    custom={1}
                    variants={blockVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-6 bg-card/50 border border-border/50 rounded-lg hover:border-amber-500/30 transition-colors"
                  >
                    <div className="h-5 bg-foreground/60 rounded w-24 mb-3" />
                    <div className="space-y-2">
                      <motion.div
                        className="h-3 bg-muted-foreground/30 rounded"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1.8, duration: 0.5 }}
                      />
                      <motion.div
                        className="h-3 bg-muted-foreground/30 rounded"
                        initial={{ width: 0 }}
                        animate={{ width: "83%" }}
                        transition={{ delay: 2, duration: 0.5 }}
                      />
                      <motion.div
                        className="h-3 bg-muted-foreground/30 rounded"
                        initial={{ width: 0 }}
                        animate={{ width: "66%" }}
                        transition={{ delay: 2.2, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>

                  {/* Skills Block */}
                  <motion.div
                    custom={2}
                    variants={blockVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-6 bg-card/50 border border-border/50 rounded-lg hover:border-amber-500/30 transition-colors"
                  >
                    <div className="h-5 bg-foreground/60 rounded w-20 mb-4" />
                    <div className="flex flex-wrap gap-2">
                      {["React", "Node.js", "TypeScript", "Figma"].map(
                        (skill, i) => (
                          <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 2 + i * 0.15 }}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium cursor-pointer"
                          >
                            {skill}
                          </motion.span>
                        )
                      )}
                    </div>
                  </motion.div>

                  {/* Projects Block */}
                  <motion.div
                    custom={3}
                    variants={blockVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-6 bg-card/50 border border-border/50 rounded-lg hover:border-amber-500/30 transition-colors"
                  >
                    <div className="h-5 bg-foreground/60 rounded w-24 mb-4" />
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div
                        className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                      <motion.div
                        className="aspect-video bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right Sidebar - Properties */}
              <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="w-56 bg-muted/30 border-l border-border/50 p-4 hidden md:block"
              >
                <div className="text-xs font-semibold text-muted-foreground mb-3">
                  PROPRIEDADES
                </div>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Nome
                    </div>
                    <div className="h-8 bg-background border border-border/50 rounded px-2 flex items-center text-sm">
                      João Silva
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Título
                    </div>
                    <div className="h-8 bg-background border border-border/50 rounded px-2 flex items-center text-sm text-muted-foreground">
                      Full Stack Developer
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Cor de Fundo
                    </div>
                    <div className="flex gap-2">
                      {[
                        { color: "bg-amber-500", active: true },
                        { color: "bg-blue-500", active: false },
                        { color: "bg-purple-500", active: false },
                        { color: "bg-green-500", active: false },
                      ].map((c, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.2 }}
                          className={`w-6 h-6 rounded cursor-pointer ${c.color} ${
                            c.active
                              ? "border-2 border-white ring-2 ring-amber-500"
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.7 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Alinhamento
                    </div>
                    <div className="flex gap-1">
                      {[
                        {
                          active: false,
                          path: "M4 6h16M4 12h8m-8 6h16",
                        },
                        {
                          active: true,
                          path: "M4 6h16M4 12h16m-16 6h16",
                        },
                        {
                          active: false,
                          path: "M4 6h16M12 12h8M4 18h16",
                        },
                      ].map((btn, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.1 }}
                          className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer ${
                            btn.active
                              ? "bg-amber-500/20 border border-amber-500/50"
                              : "bg-background border border-border/50"
                          }`}
                        >
                          <svg
                            className={`w-4 h-4 ${
                              btn.active
                                ? "text-amber-500"
                                : "text-muted-foreground"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={btn.path}
                            />
                          </svg>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            className="absolute -right-4 top-20 hidden lg:block"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm font-medium">
              Publicado!
            </div>
          </motion.div>

          <motion.div
            className="absolute -left-4 bottom-32 hidden lg:block"
            animate={{
              y: [0, 10, 0],
              rotate: [0, -3, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              12 visitantes online
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
