import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { tr } from "date-fns/locale/tr";
import TabulatorTable from "@/components/tabulator-table";
import { useCurrency } from "@/hooks/use-currency";
import ManageLetterPaymentsModal from "@/components/manage-letter-payments-modal";

export default function PaymentSchedule() {
  const { selectedCurrency, formatCurrency } = useCurrency();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);

  const { data: letters = [] } = useQuery({
    queryKey: ['/api/guarantee-letters'],
    queryFn: async () => {
      const response = await fetch('/api/guarantee-letters');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['/api/letter-payments'],
    queryFn: async () => {
      const response = await fetch('/api/letter-payments');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  });

  // Ödenmiş komisyonları toplama
  const calculatePaidCommission = (letterId: string) => {
    return payments
      .filter((p: any) => p.letterId === letterId)
      .reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
  };

  // Her mektup için ödenmemiş komisyonu hesaplama
  const calculateUnpaidCommission = (letter: any) => {
    const totalCommission = (Number(letter.letterAmount) * Number(letter.commissionRate)) / 100;
    const totalPaid = calculatePaidCommission(letter.id);
    return totalCommission - totalPaid;
  };

  const letterColumns = [
    {
      title: "Banka",
      field: "bank.name",
      width: 200,
    },
    {
      title: "Proje",
      field: "project.name",
      width: 200,
    },
    {
      title: "Mektup Türü",
      field: "letterType",
      width: 150,
    },
    {
      title: "Mektup Tutarı",
      field: "letterAmount",
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
      title: "Para Birimi",
      field: "currency",
      width: 100,
    },
    {
      title: "Komisyon Oranı",
      field: "commissionRate",
      formatter: (cell: any) => `%${cell.getValue()}`,
      width: 130,
    },
    {
      title: "Toplam Komisyon",
      field: "letterAmount",
      formatter: (cell: any) => {
        const letter = cell.getRow().getData();
        const commission = (Number(letter.letterAmount) * Number(letter.commissionRate)) / 100;
        return new Intl.NumberFormat('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(commission);
      },
      width: 150,
    },
    {
      title: "Ödenmiş Komisyon",
      field: "letterAmount",
      formatter: (cell: any) => {
        const letter = cell.getRow().getData();
        const paidCommission = calculatePaidCommission(letter.id);
        return new Intl.NumberFormat('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(paidCommission);
      },
      width: 150,
    },
    {
      title: "Kalan Komisyon",
      field: "letterAmount",
      formatter: (cell: any) => {
        const letter = cell.getRow().getData();
        const unpaidCommission = calculateUnpaidCommission(letter);
        return new Intl.NumberFormat('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(unpaidCommission);
      },
      width: 150,
    },
    {
      title: "İşlemler",
      formatter: function(_cell: any, _formatterParams: any, _onRendered: any) {
        const button = document.createElement("button");
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
        button.classList.add("p-2", "hover:bg-gray-100", "rounded-full");
        return button;
      },
      cellClick: function(_e: any, cell: any) {
        const rowData = cell.getRow().getData();
        setSelectedLetter(rowData);
        setIsPaymentsModalOpen(true);
      },
      width: 100,
      headerSort: false,
      hozAlign: "center",
      download: false,
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                <span>Teminat Mektubu Komisyonları</span>
              </div>
            </h2>
          </div>

          <TabulatorTable
            data={letters}
            columns={letterColumns as any}
            isCredits={false}
          />
        </div>
      </Card>

      <ManageLetterPaymentsModal
        isOpen={isPaymentsModalOpen}
        onOpenChange={setIsPaymentsModalOpen}
        selectedLetter={selectedLetter}
      />
    </div>
  );
}
