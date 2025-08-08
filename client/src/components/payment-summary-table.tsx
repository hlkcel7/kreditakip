import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TabulatorTable from "./tabulator-table";
import LetterPaymentsModal from "./letter-payments-modal";
import type { ColumnDefinition } from "./tabulator-table";

interface PaymentSummary {
  letterId: string;
  totalCommission: number;
  totalPaid: number;
  totalBsmv: number;
  remainingCommission: number;
  payments: number;
  lastPaymentDate: string | null;
}

export default function PaymentSummaryTable() {
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: letters = [] } = useQuery({
    queryKey: ["/api/guarantee-letters"],
    queryFn: async () => {
      const response = await fetch("/api/guarantee-letters");
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });

  const { data: letterSummaries = [] } = useQuery<PaymentSummary[]>({
    queryKey: ["/api/letter-payments/summary"],
    queryFn: async () => {
      const summaryPromises = letters.map((letter: any) =>
        fetch(`/api/letter-payments/${letter.id}/summary`).then((res) =>
          res.json()
        )
      );
      return await Promise.all(summaryPromises);
    },
    enabled: letters.length > 0,
  });

  const letterWithSummaries = letters.map((letter: any) => {
    const summary = letterSummaries.find((s) => s.letterId === letter.id) || {
      totalCommission: 0,
      totalPaid: 0,
      totalBsmv: 0,
      remainingCommission: 0,
      payments: 0,
      lastPaymentDate: null,
    };
    return {
      ...letter,
      ...summary,
    };
  });

  const columns: ColumnDefinition[] = [
    {
      title: "İşlemler",
      width: 100,
      formatter: (_cell: any) => {
        return `
          <button class="payments-button p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </button>
        `;
      },
      headerSort: false,
      cellClick: (e: any, cell: any) => {
        const row = cell.getRow();
        setSelectedLetter(row.getData());
        setIsPaymentModalOpen(true);
      },
    },
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
      title: "Mektup Tutarı",
      field: "letterAmount",
      formatter: (cell: any) => {
        const data = cell.getRow().getData();
        return new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: data.currency,
        }).format(Number(cell.getValue()));
      },
      width: 150,
    },
    {
      title: "Komisyon",
      field: "totalCommission",
      formatter: (cell: any) => {
        const data = cell.getRow().getData();
        return new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: data.currency,
        }).format(Number(cell.getValue()));
      },
      width: 150,
    },
    {
      title: "Ödenen",
      field: "totalPaid",
      formatter: (cell: any) => {
        const data = cell.getRow().getData();
        return new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: data.currency,
        }).format(Number(cell.getValue()));
      },
      width: 150,
    },
    {
      title: "Kalan",
      field: "remainingCommission",
      formatter: (cell: any) => {
        const data = cell.getRow().getData();
        return new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: data.currency,
        }).format(Number(cell.getValue()));
      },
      width: 150,
    },
    {
      title: "Son Ödeme",
      field: "lastPaymentDate",
      formatter: (cell: any) => {
        const value = cell.getValue();
        if (!value) return "-";
        return new Date(value).toLocaleDateString("tr-TR");
      },
      width: 150,
    },
  ];

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <TabulatorTable
            data={letterWithSummaries}
            columns={columns}
            options={{ layout: "fitColumns", pagination: true, paginationSize: 10 }}
          />
        </CardContent>
      </Card>

      <LetterPaymentsModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        letter={selectedLetter}
      />
    </>
  );
}
