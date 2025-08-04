import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

interface ManageProjectsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageProjectsModal({ open, onOpenChange }: ManageProjectsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PATCH', `/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Başarılı",
        description: "Proje güncellendi.",
      });
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Proje güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Başarılı",
        description: "Proje silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Proje silinemedi.",
        variant: "destructive",
      });
    },
  });

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateMutation.mutate({
        id: editingId,
        data: { name: editName.trim() }
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const deleteProject = (id: string) => {
    if (confirm("Bu projeyi silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Proje Yönetimi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.isArray(projects) && projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                {editingId === project.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mr-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                ) : (
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-500">
                      {project.description || "Açıklama yok"}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Badge variant="secondary">
                  {project.status === 'aktif' ? 'Aktif' : 
                   project.status === 'beklemede' ? 'Beklemede' : 
                   project.status === 'tamamlandi' ? 'Tamamlandı' : 'İptal'}
                </Badge>
                
                {editingId === project.id ? (
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={saveEdit}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(project)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProject(project.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {(!projects || projects.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              Henüz proje bulunmuyor
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}