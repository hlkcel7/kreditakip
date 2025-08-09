import React, { useEffect, useRef } from "react";
import { TabulatorFull as Tabulator, ColumnDefinition as TabulatorColumnDefinition } from "tabulator-tables";
import { useQuery } from "@tanstack/react-query";
import type { GuaranteeLetterWithRelations, CreditWithRelations } from "@shared/schema";
import { useCurrency } from "@/hooks/use-currency";
import "tabulator-tables/dist/css/tabulator.min.css";

// Column definition types
export interface ColumnDefinition extends Omit<TabulatorColumnDefinition, 'editor' | 'editorParams'> {
  editor?: Editor;
  editorParams?: EditorParams;
}

type Editor = "input" | "textarea" | "number" | "range" | "select" | "star" | "progress" | "tickCross" | "checkbox" | "date";

interface EditorParams {
  min?: number;
  max?: number;
  step?: number;
  values?: Record<string, string>;
  verticalNavigation?: "editor" | "table";
}

interface TabulatorTableProps {
  data: GuaranteeLetterWithRelations[] | CreditWithRelations[] | any[];
  selectedCurrency?: string;
  exchangeRates?: Record<string, number>;
  isCredits?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onPayments?: (row: any) => void;
  columns?: ColumnDefinition[];
  options?: Record<string, any>;
}

export default function TabulatorTable({ 
  data, 
  selectedCurrency = 'TRY', 
  exchangeRates = {}, 
  isCredits = false,
  onEdit,
  onDelete,
  onPayments,
  columns,
  options = {}
}: TabulatorTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (!tableRef.current || !data) return;

    const convertCurrency = (amount: number, fromCurrency: string) => {
      return amount; // Para birimini çevirme, olduğu gibi bırak
    };

    const guaranteeColumns: ColumnDefinition[] = [
      {
        title: "İşlemler",
        width: 150,
        frozen: true,
        headerSort: false,
        formatter: (cell: any) => {
          const row = cell.getRow();
          return `
            <div class="flex space-x-2">
              <button class="edit-button text-blue-600 hover:text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button class="payments-button text-green-600 hover:text-green-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                </svg>
              </button>
              <button class="delete-button text-red-600 hover:text-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          `;
        },
        cellClick: (e: any, cell: any) => {
          const element = e.target as HTMLElement;
          const row = cell.getRow();
          
          if (element.closest('.edit-button')) {
            onEdit?.(row.getData());
          } else if (element.closest('.payments-button')) {
            onPayments?.(row.getData());
          } else if (element.closest('.delete-button')) {
            onDelete?.(row.getData());
          }
        }
      },
      {
        title: "Banka",
        field: "bank.name",
        width: 150,
        frozen: true,
        formatter: (cell: any) => cell.getValue() || "Bilinmiyor"
      },
      {
        title: "Proje",
        field: "project.name",
        width: 150,
        formatter: (cell: any) => cell.getValue() || "Bilinmiyor"
      },
      {
        title: "Mektup Türü",
        field: "letterType",
        width: 130,
        editor: "select",
        editorParams: {
          values: {
            'teminat': 'Teminat',
            'avans': 'Avans Teminat',
            'kesin-teminat': 'Kesin Teminat',
            'gecici-teminat': 'Geçici Teminat'
          }
        },
        formatter: (cell: any) => {
          const value = cell.getValue();
          const typeMap: { [key: string]: string } = {
            'teminat': 'Teminat',
            'avans': 'Avans Teminat',
            'kesin-teminat': 'Kesin Teminat',
            'gecici-teminat': 'Geçici Teminat'
          };
          return typeMap[value] || value;
        }
      },
      {
        title: "Sözleşme Tutarı",
        field: "contractAmount",
        width: 130,
        editor: "number",
        editorParams: {
          min: 0,
          step: 0.01
        },
        formatter: (cell: any) => {
          const value = parseFloat(cell.getValue() || '0');
          const currency = cell.getRow().getData().currency;
          return formatCurrency(value, currency);
        }
      },
      {
        title: "Mektup %",
        field: "letterPercentage",
        width: 80,
        formatter: (cell: any) => `%${parseFloat(cell.getValue() || '0').toFixed(2)}`
      },
      {
        title: "Mektup Tutarı",
        field: "letterAmount",
        width: 130,
        formatter: (cell: any) => {
          const value = parseFloat(cell.getValue() || '0');
          const currency = cell.getRow().getData().currency;
          return formatCurrency(value, currency);
        }
      },
      {
        title: "Komisyon %",
        field: "commissionRate",
        width: 100,
        formatter: (cell: any) => `%${parseFloat(cell.getValue() || '0').toFixed(2)}`
      },
      {
        title: "Toplam Komisyon",
        field: "totalCommission",
        width: 130,
        formatter: (cell: any) => {
          const rowData = cell.getRow().getData();
          const letterAmount = parseFloat(rowData.letterAmount || '0');
          const commissionRate = parseFloat(rowData.commissionRate || '0');
          const bsmvAndOtherCosts = parseFloat(rowData.bsmvAndOtherCosts || '0');
          
          // Sayısal kontrolleri ekle
          let commissionAmount = 0;
          if (!isNaN(letterAmount) && !isNaN(commissionRate)) {
            commissionAmount = (letterAmount * commissionRate) / 100;
          }
          
          let totalCommission = commissionAmount;
          if (!isNaN(bsmvAndOtherCosts)) {
            totalCommission += bsmvAndOtherCosts;
          }
          
          const currency = rowData.currency;
          return formatCurrency(totalCommission, currency);
        }
      },
      {
        title: "Para Birimi",
        field: "currency",
        width: 80,
      },
      {
        title: "Alım Tarihi",
        field: "purchaseDate",
        width: 110,
        formatter: (cell: any) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString('tr-TR');
        }
      },

      {
        title: "Son Tarih",
        field: "expiryDate",
        width: 110,
        formatter: (cell: any) => {
          const value = cell.getValue();
          if (!value) return '-';
          const date = new Date(value);
          return date.toLocaleDateString('tr-TR');
        }
      },
      {
        title: "Durum",
        field: "status",
        width: 100,
        editor: "select",
        editorParams: {
          values: {
            'aktif': 'Aktif',
            'beklemede': 'Beklemede',
            'kapali': 'Kapalı',
            'iptal': 'İptal'
          }
        },
        formatter: (cell: any) => {
          const value = cell.getValue();
          const statusMap: { [key: string]: { text: string, class: string } } = {
            'aktif': { text: 'Aktif', class: 'bg-green-100 text-green-800' },
            'beklemede': { text: 'Beklemede', class: 'bg-yellow-100 text-yellow-800' },
            'kapali': { text: 'Kapalı', class: 'bg-gray-100 text-gray-800' },
            'iptal': { text: 'İptal', class: 'bg-red-100 text-red-800' }
          };
          const status = statusMap[value] || { text: value, class: 'bg-gray-100 text-gray-800' };
          return `<span class="px-2 py-1 rounded-full text-xs font-medium ${status.class}">${status.text}</span>`;
        }
      },
      {
        title: "Notlar",
        field: "notes",
        width: 200,
        editor: "textarea",
        editorParams: {
          verticalNavigation: "editor"
        },
        formatter: (cell: any) => {
          const value = cell.getValue();
          return value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-';
        }
      }
    ];

    const creditColumns: ColumnDefinition[] = [
      {
        title: "İşlemler",
        width: 100,
        frozen: true,
        headerSort: false,
        formatter: (cell: any) => {
          return `
            <div class="flex space-x-2">
              <button class="edit-button text-blue-600 hover:text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button class="delete-button text-red-600 hover:text-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          `;
        },
        cellClick: (e: any, cell: any) => {
          const element = e.target as HTMLElement;
          const row = cell.getRow();
          
          if (element.closest('.edit-button')) {
            onEdit?.(row.getData());
          } else if (element.closest('.delete-button')) {
            onDelete?.(row.getData());
          }
        }
      },
      {
        title: "Banka",
        field: "bank.name",
        width: 150,
        frozen: true,
        formatter: (cell: any) => cell.getValue() || "Bilinmiyor"
      },
      {
        title: "Proje",
        field: "project.name",
        width: 150,
        formatter: (cell: any) => cell.getValue() || "Bilinmiyor"
      },
      {
        title: "Ana Para",
        field: "principalAmount",
        width: 130,
        editor: "number",
        editorParams: {
          min: 0,
          step: 0.01
        },
        formatter: (cell: any) => {
          const value = parseFloat(cell.getValue() || '0');
          const currency = cell.getRow().getData().currency;
          return formatCurrency(value, currency);
        }
      },
      {
        title: "Faiz Oranı (%)",
        field: "interestAmount",
        width: 130,
        editor: "number",
        editorParams: {
          min: 0,
          step: 0.01
        },
        formatter: (cell: any) => {
          const value = parseFloat(cell.getValue() || '0');
          return value.toFixed(2);
        }
      },
      {
        title: "BSMV ve Diğer Masraflar",
        field: "bsmvAndOtherCosts",
        width: 130,
        editor: "number",
        editorParams: {
          min: 0,
          step: 0.01
        },
        formatter: (cell: any) => {
          const value = cell.getValue();
          const numericValue = typeof value === 'string' ? parseFloat(value) : (value || 0);
          const currency = cell.getRow().getData().currency;
          return formatCurrency(numericValue, currency);
        }
      },
      {
        title: "Geri Ödenen",
        field: "totalRepaidAmount",
        width: 130,
        editor: "number",
        editorParams: {
          min: 0,
          step: 0.01
        },
        formatter: (cell: any) => {
          const value = parseFloat(cell.getValue() || '0');
          const currency = cell.getRow().getData().currency;
          return formatCurrency(value, currency);
        }
      },
      {
        title: "Para Birimi",
        field: "currency",
        width: 80,
      },
      {
        title: "Kredi Tarihi",
        field: "creditDate",
        width: 110,
        formatter: (cell: any) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString('tr-TR');
        }
      },
      {
        title: "Vade Tarihi",
        field: "maturityDate",
        width: 110,
        formatter: (cell: any) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString('tr-TR');
        }
      },
      {
        title: "Durum",
        field: "status",
        width: 100,
        editor: "select",
        editorParams: {
          values: {
            'devam-ediyor': 'Devam Ediyor',
            'kapali': 'Kapalı',
            'iptal': 'İptal'
          }
        },
        formatter: (cell: any) => {
          const value = cell.getValue();
          const creditStatusMap: { [key: string]: { text: string, class: string } } = {
            'devam-ediyor': { text: 'Devam Ediyor', class: 'bg-green-100 text-green-800' },
            'kapali': { text: 'Kapalı', class: 'bg-gray-100 text-gray-800' },
            'iptal': { text: 'İptal', class: 'bg-red-100 text-red-800' }
          };
          const status = creditStatusMap[value] || { text: value, class: 'bg-gray-100 text-gray-800' };
          return `<span class="px-2 py-1 rounded-full text-xs font-medium ${status.class}">${status.text}</span>`;
        }
      },
      {
        title: "Notlar",
        field: "notes",
        width: 200,
        editor: "textarea",
        editorParams: {
          verticalNavigation: "editor"
        },
        formatter: (cell: any) => {
          const value = cell.getValue();
          return value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-';
        }
      }
    ];

    if (tabulatorRef.current) {
      tabulatorRef.current.destroy();
    }

    const onCellEdited = async (cell: any) => {
      const row = cell.getRow();
      const rowData = row.getData();
      const field = cell.getField();
      const value = cell.getValue();
      const id = rowData.id;

      try {
        const endpoint = isCredits ? '/api/credits' : '/api/guarantee-letters';
        const response = await fetch(`${endpoint}/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [field]: value }),
        });

        if (!response.ok) {
          throw new Error('Güncelleme başarısız');
        }

        // Başarılı güncelleme sonrası row'u yeşil yanıp sönerek göster
        row.getElement().style.transition = 'background-color 1s';
        row.getElement().style.backgroundColor = '#86efac';
        setTimeout(() => {
          row.getElement().style.backgroundColor = '';
        }, 1000);

      } catch (error) {
        console.error('Güncelleme hatası:', error);
        cell.restoreOldValue(); // Hata durumunda eski değere geri dön
        
        // Hata durumunda row'u kırmızı yanıp sönerek göster
        row.getElement().style.transition = 'background-color 1s';
        row.getElement().style.backgroundColor = '#fecaca';
        setTimeout(() => {
          row.getElement().style.backgroundColor = '';
        }, 1000);
      }
    };

    tabulatorRef.current = new Tabulator(tableRef.current, {
      data: data,
      // @ts-ignore - Tabulator types are incomplete
      columns: columns || (isCredits ? creditColumns : guaranteeColumns),
      layout: "fitDataStretch",
      responsiveLayout: "hide",
      pagination: true,
      paginationSize: 25,
      paginationSizeSelector: [10, 25, 50, 100],
      movableColumns: true,
      resizableRows: true,
      // @ts-ignore - Tabulator types are incomplete
      cellEdited: onCellEdited,

      printAsHtml: true,
      printStyled: true,
      downloadConfig: {
        columnGroups: false,
        rowGroups: false,
        columnCalcs: false
      },
      downloadRowRange: "all",
      langs: {
        "tr": {
          "pagination": {
            "first": "İlk",
            "first_title": "İlk Sayfa",
            "last": "Son",
            "last_title": "Son Sayfa",
            "prev": "Önceki",
            "prev_title": "Önceki Sayfa",
            "next": "Sonraki",
            "next_title": "Sonraki Sayfa"
          }
        }
      },
      locale: "tr",
      height: "500px",
      ...options
    });

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
      }
    };
  }, [data, selectedCurrency, exchangeRates, isCredits, formatCurrency]);

  return (
    <div className="w-full">
      <div ref={tableRef} className="tabulator-table"></div>
    </div>
  );
}
