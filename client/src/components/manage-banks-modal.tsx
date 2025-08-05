import { useState } from "react";
import { BankForm, BankFormData } from "./bank-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Bank } from "@shared/schema";

interface ManageBanksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageBanksModal({ open, onOpenChange }: ManageBanksModalProps) {
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banks } = useQuery<Bank[]>({
    queryKey: ['/api/banks'],
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest('PATCH', `/api/banks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banks'] });
      toast({
        title: "Başarılı",
        description: "Banka güncellendi.",
      });
      setEditingBank(null);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Banka güncellenemedi.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/banks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banks'] });
      toast({
        title: "Başarılı",
        description: "Banka silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Banka silinemedi.",
        variant: "destructive",
      });
    },
  });

  const startEdit = (bank: Bank) => {
    setEditingBank(bank);
  };

  const handleEditSubmit = (data: BankFormData) => {
    if (editingBank) {
      updateMutation.mutate({
        id: editingBank.id,
        data: {
          name: data.name,
          branchName: data.branchName,
          contactPerson: data.contactPerson,
          phone: data.phone,
          email: data.email,
          address: data.address,
          status: data.status,
        }
      });
    }
  };

  const cancelEdit = () => {
    setEditingBank(null);
  };

  const deleteBank = (id: string) => {
    if (confirm("Bu bankayı silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Banka Yönetimi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.isArray(banks) && banks.map((bank) => (
            <div key={bank.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                {editingBank && editingBank.id === bank.id ? (
                  <BankForm
                    initialValues={{
                      name: bank.name ?? "",
                      branchName: bank.branchName ?? "",
                      contactPerson: bank.contactPerson ?? "",
                      phone: bank.phone ?? "",
                      email: bank.email ?? "",
                      address: bank.address ?? "",
                      status: bank.status ?? "aktif",
                    }}
                    onSubmit={handleEditSubmit}
                    isPending={updateMutation.isPending}
                    submitLabel="Güncelle"
                    onCancel={cancelEdit}
                  />
                ) : (
                  <>
                    <div>
                      <div className="font-medium">{bank.name}</div>
                      <div className="text-sm text-gray-500">
                        {bank.branchName || "Şube belirtilmemiş"}
                      </div>
                      {bank.contactPerson && (
                        <div className="text-xs text-gray-400">
                          İletişim: {bank.contactPerson}
                        </div>
                      )}
                      {bank.phone && (
                        <div className="text-xs text-gray-400">
                          Telefon: {bank.phone}
                        </div>
                      )}
                      {bank.email && (
                        <div className="text-xs text-gray-400">
                          E-posta: {bank.email}
                        </div>
                      )}
                      {bank.address && (
                        <div className="text-xs text-gray-400">
                          Adres: {bank.address}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(bank)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBank(bank.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Badge variant="secondary">
                  {bank.status === 'aktif' ? 'Aktif' : 'Pasif'}
                </Badge>
                
                {/* editingId tamamen kaldırıldı, sadece editingBank ile form açılıyor. */}
              </div>
            </div>
          ))}
          
          {(!banks || banks.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              Henüz banka bulunmuyor
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