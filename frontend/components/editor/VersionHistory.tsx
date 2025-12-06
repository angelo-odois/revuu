"use client";

import { useState } from "react";
import { History, RotateCcw, Trash2, Clock, Save, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore, PageVersion } from "@/lib/store";
import { cn } from "@/lib/utils";

interface VersionHistoryProps {
  children: React.ReactNode;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays < 7) return `${diffDays} dias atras`;
  return formatDate(dateString);
}

export function VersionHistory({ children }: VersionHistoryProps) {
  const { versions, saveVersion, restoreVersion, deleteVersion, blocks } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [confirmRestore, setConfirmRestore] = useState<PageVersion | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PageVersion | null>(null);

  const handleSaveVersion = () => {
    saveVersion(versionLabel || undefined);
    setVersionLabel("");
  };

  const handleRestore = (version: PageVersion) => {
    setConfirmRestore(version);
  };

  const handleConfirmRestore = () => {
    if (confirmRestore) {
      restoreVersion(confirmRestore.id);
      setConfirmRestore(null);
      setOpen(false);
    }
  };

  const handleDelete = (version: PageVersion) => {
    setConfirmDelete(version);
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteVersion(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historico de Versoes
            </DialogTitle>
            <DialogDescription>
              Salve e restaure versoes anteriores da sua pagina.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Nome da versao (opcional)"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveVersion} disabled={blocks.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {versions.length} de 20 versoes salvas
            </div>

            <ScrollArea className="h-[400px] pr-4">
              {sortedVersions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma versao salva ainda</p>
                  <p className="text-sm">Clique em &quot;Salvar&quot; para criar um ponto de restauracao</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedVersions.map((version, index) => (
                    <div
                      key={version.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors",
                        index === 0 && "border-primary/50 bg-primary/5"
                      )}
                    >
                      <div className="flex-shrink-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {version.label ? (
                            <span className="font-medium flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {version.label}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Versao automatica
                            </span>
                          )}
                          {index === 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              Mais recente
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{getTimeAgo(version.createdAt)}</span>
                          <span>•</span>
                          <span>{version.blocks.length} blocos</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(version)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(version)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar versao?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso substituira o conteudo atual da pagina pela versao selecionada.
              {confirmRestore?.label && (
                <span className="block mt-2 font-medium">
                  Versao: {confirmRestore.label}
                </span>
              )}
              <span className="block text-sm">
                Criada em: {confirmRestore && formatDate(confirmRestore.createdAt)}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir versao?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
