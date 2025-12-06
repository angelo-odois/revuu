"use client";

import { useState } from "react";
import { Save, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEditorStore } from "@/lib/store";

interface SaveTemplateDialogProps {
  children: React.ReactNode;
}

export function SaveTemplateDialog({ children }: SaveTemplateDialogProps) {
  const { saveAsTemplate, blocks } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    saveAsTemplate(name.trim(), description.trim());
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Salvar como Template
          </DialogTitle>
          <DialogDescription>
            Salve o layout atual como um template reutilizavel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Nome do Template *</Label>
            <Input
              id="templateName"
              placeholder="Ex: Landing Page Servicos"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateDescription">Descricao</Label>
            <Textarea
              id="templateDescription"
              placeholder="Descreva o template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-medium">Este template incluira:</p>
            <ul className="mt-1 text-muted-foreground list-disc list-inside">
              <li>{blocks.length} blocos</li>
              <li>Todas as configuracoes de conteudo</li>
              <li>Estilos personalizados</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || blocks.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
