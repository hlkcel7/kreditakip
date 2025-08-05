import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BankForm, BankFormData } from "./bank-form";
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

interface AddBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Artık BankFormData kullanılıyor, tip hatası olmaması için aşağıdaki satırı kaldırıyoruz

export default function AddBankModal({ open, onOpenChange }: AddBankModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const mutation = useMutation({
    mutationFn: (data: BankFormData) => {
      // Backend ile uyumlu veri oluştur
      const submitData = {
        name: data.name,
        code: data.code ?? "", // Eğer formda yoksa boş string
        contactInfo: `${data.branchName ?? ""} ${data.contactPerson ?? ""} ${data.phone ?? ""} ${data.email ?? ""} ${data.address ?? ""}`.trim(),
        status: data.status,
      };
      return apiRequest('POST', '/api/banks', submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Başarılı",
        description: "Banka başarıyla eklendi.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Banka eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BankFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Banka Ekle</DialogTitle>
          <DialogDescription>
            Yeni bir banka ekleyin. Bu banka teminat mektupları ve krediler için kullanılabilir.
          </DialogDescription>
        </DialogHeader>

        <BankForm
          initialValues={{}}
          onSubmit={handleSubmit}
          isPending={mutation.isPending}
          submitLabel="Banka Ekle"
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}