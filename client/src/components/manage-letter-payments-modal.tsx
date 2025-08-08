import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TabulatorTable from "@/components/tabulator-table";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function ManageLetterPaymentsModal({
  isOpen,
  onOpenChange,
  selectedLetter,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedLetter: any;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [bsmv, setBsmv] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [description, setDescription] = useState("");

  const { data: letterPayments = [] } = useQuery({
    queryKey: ["letterPayments", selectedLetter?.id],
    queryFn: () =>
      fetch(`/api/letter-payments/letter/${selectedLetter?.id}`).then((res) =>
        res.json()
      ),
    enabled: !!selectedLetter?.id,
  });

  const addPaymentMutation = useMutation({
    mutationFn: (newPayment: any) =>
      fetch("/api/letter-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPayment),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letterPayments"] });
      toast({
        title: "Ödeme eklendi",
        description: "Teminat mektubu ödemesi başarıyla eklendi.",
      });
      clearForm();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ödeme eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/letter-payments/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["letterPayments"] });
      toast({
        title: "Ödeme silindi",
        description: "Teminat mektubu ödemesi başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ödeme silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const clearForm = () => {
    setPaymentDate("");
    setAmount("");
    setBsmv("");
    setReceiptNo("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLetter) return;

    const newPayment = {
      letterId: selectedLetter.id,
      paymentDate: new Date(paymentDate),
      amount: parseFloat(amount),
      bsmv: parseFloat(bsmv || "0"),
      receiptNo: receiptNo || undefined,
      description: description || undefined,
    };

    addPaymentMutation.mutate(newPayment);
  };

  const columns = [
    {
      title: "Ödeme Tarihi",
      field: "paymentDate",
      formatter: (cell: any) =>
        format(new Date(cell.getValue()), "dd MMM yyyy", { locale: tr }),
    },
    { title: "Tutar", field: "amount", formatter: "money", formatterParams: {
      decimal: ",",
      thousand: ".",
      symbol: "",
      precision: 2,
    }},
    { title: "BSMV", field: "bsmv", formatter: "money", formatterParams: {
      decimal: ",",
      thousand: ".",
      symbol: "",
      precision: 2,
    }},
    { title: "Makbuz No", field: "receiptNo" },
    { title: "Açıklama", field: "description" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Teminat Mektubu Ödemeleri</DialogTitle>
          <DialogDescription>
            {selectedLetter && (
              <>
                {selectedLetter.bank?.name} - {selectedLetter.letterType} -{" "}
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: selectedLetter.currency,
                }).format(selectedLetter.letterAmount)}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Ödeme Tarihi</label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm">Tutar</label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm">BSMV</label>
              <Input
                type="number"
                step="0.01"
                value={bsmv}
                onChange={(e) => setBsmv(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Makbuz No</label>
              <Input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm">Açıklama</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit">Ödeme Ekle</Button>
        </form>

        <div className="mt-4">
          <TabulatorTable
            data={letterPayments}
            columns={columns as any}
            options={{
              layout: "fitColumns",
              pagination: false,
            }}
            isCredits={false}
            onDelete={(row) => {
              const id = row.getData().id;
              deletePaymentMutation.mutate(id);
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
