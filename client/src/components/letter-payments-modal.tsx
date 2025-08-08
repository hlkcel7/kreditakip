import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import TabulatorTable from "@/components/tabulator-table";

interface LetterPayment {
  id: string;
  letterId: string;
  paymentDate: string;
  amount: number;
  bsmv: number;
  receiptNo?: string;
  description?: string;
}

interface PaymentModalProps {
  letterId: string;
  isOpen: boolean;
  onClose: () => void;
  refetchPayments: () => void;
}

function AddPaymentModal({ letterId, isOpen, onClose, refetchPayments }: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [bsmv, setBsmv] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [description, setDescription] = useState("");

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
      toast({
        title: "Ödeme eklendi",
        description: "Teminat mektubu ödemesi başarıyla eklendi.",
      });
      refetchPayments();
      onClose();
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

  const clearForm = () => {
    setPaymentDate("");
    setAmount("");
    setBsmv("");
    setReceiptNo("");
    setDescription("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPayment = {
      letterId,
      paymentDate: new Date(paymentDate),
      amount: parseFloat(amount),
      bsmv: parseFloat(bsmv || "0"),
      receiptNo: receiptNo || undefined,
      description: description || undefined,
    };

    addPaymentMutation.mutate(newPayment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Ödeme Ekle</DialogTitle>
          <DialogDescription>
            Teminat mektubu için yeni bir ödeme kaydı ekleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="paymentDate">Ödeme Tarihi</label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="amount">Tutar</label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="bsmv">BSMV</label>
              <Input
                id="bsmv"
                type="number"
                step="0.01"
                value={bsmv}
                onChange={(e) => setBsmv(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="receiptNo">Makbuz No</label>
              <Input
                id="receiptNo"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description">Açıklama</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">Ekle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface PaymentTableProps {
  letterId: string;
}

function PaymentTable({ letterId }: PaymentTableProps) {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    data: payments = [],
    isLoading,
    refetch,
  } = useQuery<LetterPayment[]>({
    queryKey: ["letterPayments", letterId],
    queryFn: () =>
      fetch(`/api/letter-payments/letter/${letterId}`).then((res) => res.json()),
  });

  const { data: letterSummary } = useQuery({
    queryKey: ["letterPaymentSummary", letterId],
    queryFn: () =>
      fetch(`/api/letter-payments/${letterId}/summary`).then((res) => res.json()),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/letter-payments/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({
        title: "Ödeme silindi",
        description: "Teminat mektubu ödemesi başarıyla silindi.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ödeme silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  const paymentColumns = [
    {
      title: "Ödeme Tarihi",
      field: "paymentDate",
      width: 150,
      formatter: (cell: any) =>
        format(new Date(cell.getValue()), "dd MMM yyyy", { locale: tr }),
    },
    {
      title: "Tutar",
      field: "amount",
      formatter: "money",
      formatterParams: {
        decimal: ",",
        thousand: ".",
        symbol: "",
        precision: 2,
      },
      width: 150,
      bottomCalc: "sum",
      bottomCalcFormatter: "money",
      bottomCalcFormatterParams: {
        decimal: ",",
        thousand: ".",
        symbol: "",
        precision: 2,
      },
    },
    {
      title: "BSMV",
      field: "bsmv",
      formatter: "money",
      formatterParams: {
        decimal: ",",
        thousand: ".",
        symbol: "",
        precision: 2,
      },
      width: 150,
      bottomCalc: "sum",
      bottomCalcFormatter: "money",
      bottomCalcFormatterParams: {
        decimal: ",",
        thousand: ".",
        symbol: "",
        precision: 2,
      },
    },
    {
      title: "Makbuz No",
      field: "receiptNo",
      width: 150,
    },
    {
      title: "Açıklama",
      field: "description",
      width: 200,
    },
    {
      title: "İşlemler",
      width: 100,
      formatter: (_cell: any) => {
        return `
          <button class="delete-button p-2 text-red-600 hover:text-red-800">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        `;
      },
      cellClick: (e: any, cell: any) => {
        const element = e.target as HTMLElement;
        if (element.closest(".delete-button")) {
          const row = cell.getRow();
          const data = row.getData();
          deletePaymentMutation.mutate(data.id);
        }
      },
      headerSort: false,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ödeme Listesi</h3>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Ödeme
        </Button>
      </div>

      {letterSummary && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">
                Toplam Komisyon
              </div>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(letterSummary.totalCommission)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">
                Ödenen Tutar
              </div>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(letterSummary.totalPaid)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Kalan Tutar</div>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(letterSummary.remainingCommission)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <TabulatorTable
        data={payments}
        columns={paymentColumns as any}
        options={{
          layout: "fitColumns",
          pagination: false,
        }}
        isCredits={false}
      />

      <AddPaymentModal
        letterId={letterId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refetchPayments={refetch}
      />
    </div>
  );
}

export interface LetterPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: any;
}

export default function LetterPaymentsModal({
  isOpen,
  onClose,
  letter,
}: LetterPaymentsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Teminat Mektubu Ödemeleri</DialogTitle>
          <DialogDescription>
            {letter?.bank?.name} - {letter?.letterType} -{" "}
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: letter?.currency,
            }).format(letter?.letterAmount)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-4">
            <PaymentTable letterId={letter?.id} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {/* İleriki aşamada eklenecek */}
            <div>Yakında eklenecek...</div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
