import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectForm, ProjectFormData } from "./project-form";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function AddProjectModal({ open, onOpenChange }: AddProjectModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const mutation = useMutation({
    mutationFn: (data: ProjectFormData) => {
      return apiRequest('POST', '/api/projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Başarılı",
        description: "Proje başarıyla eklendi.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Proje eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ProjectFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Proje Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir proje oluşturun. Bu proje teminat mektupları ve krediler için kullanılabilir.
          </DialogDescription>
        </DialogHeader>

        <ProjectForm
          initialValues={{}}
          onSubmit={handleSubmit}
          isPending={mutation.isPending}
          submitLabel="Proje Ekle"
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}