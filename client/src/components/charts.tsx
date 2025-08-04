import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuaranteeLetterWithRelations } from "@shared/schema";
import { useCurrency } from "@/hooks/use-currency";

interface ChartsProps {
  letters: GuaranteeLetterWithRelations[];
}

export default function Charts({ letters }: ChartsProps) {
  const letterTypeChartRef = useRef<HTMLCanvasElement>(null);
  const bankDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const monthlyTrendChartRef = useRef<HTMLCanvasElement>(null);
  const riskAnalysisChartRef = useRef<HTMLCanvasElement>(null);
  
  const letterTypeChartInstanceRef = useRef<Chart | null>(null);
  const bankDistributionChartInstanceRef = useRef<Chart | null>(null);
  const monthlyTrendChartInstanceRef = useRef<Chart | null>(null);
  const riskAnalysisChartInstanceRef = useRef<Chart | null>(null);

  const { formatCurrency } = useCurrency();

  useEffect(() => {
    // Clean up existing charts
    [
      letterTypeChartInstanceRef,
      bankDistributionChartInstanceRef,
      monthlyTrendChartInstanceRef,
      riskAnalysisChartInstanceRef,
    ].forEach(chartRef => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    });

    if (!letters.length) return;

    // Letter Type Distribution Chart
    if (letterTypeChartRef.current) {
      const letterTypeCounts = letters.reduce((acc, letter) => {
        const type = letter.letterType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const typeLabels = {
        'teminat': 'Teminat Mektubu',
        'avans': 'Avans Teminat',
        'kesin-teminat': 'Kesin Teminat',
        'gecici-teminat': 'Geçici Teminat'
      };

      letterTypeChartInstanceRef.current = new Chart(letterTypeChartRef.current, {
        type: 'doughnut',
        data: {
          labels: Object.keys(letterTypeCounts).map(key => typeLabels[key as keyof typeof typeLabels] || key),
          datasets: [{
            data: Object.values(letterTypeCounts),
            backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Bank Distribution Chart
    if (bankDistributionChartRef.current) {
      const bankCounts = letters.reduce((acc, letter) => {
        const bankName = letter.bank?.name || 'Bilinmeyen';
        acc[bankName] = (acc[bankName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      bankDistributionChartInstanceRef.current = new Chart(bankDistributionChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(bankCounts),
          datasets: [{
            label: 'Mektup Sayısı',
            data: Object.values(bankCounts),
            backgroundColor: '#3B82F6',
            borderColor: '#1E40AF',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Monthly Trend Chart
    if (monthlyTrendChartRef.current) {
      const monthlyData = letters.reduce((acc, letter) => {
        const date = new Date(letter.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const amount = parseFloat(letter.letterAmount || '0');
        acc[monthKey] = (acc[monthKey] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      const sortedMonths = Object.keys(monthlyData).sort();
      const monthLabels = sortedMonths.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month));
        return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
      });

      monthlyTrendChartInstanceRef.current = new Chart(monthlyTrendChartRef.current, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: [{
            label: 'Toplam Tutar',
            data: sortedMonths.map(month => monthlyData[month]),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return formatCurrency(value as number);
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Toplam: ${formatCurrency(context.parsed.y)}`;
                }
              }
            }
          }
        }
      });
    }

    // Risk Analysis Chart (Mock data for demonstration)
    if (riskAnalysisChartRef.current) {
      riskAnalysisChartInstanceRef.current = new Chart(riskAnalysisChartRef.current, {
        type: 'radar',
        data: {
          labels: ['Likidite', 'Kredi', 'Piyasa', 'Operasyonel', 'Ülke'],
          datasets: [{
            label: 'Risk Seviyesi',
            data: [65, 75, 60, 70, 80],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            pointBackgroundColor: '#F59E0B'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }

  }, [letters, formatCurrency]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Mektup Türlerine Göre Dağılım</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={letterTypeChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bankalara Göre Dağılım</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={bankDistributionChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aylık Trend Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={monthlyTrendChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <canvas ref={riskAnalysisChartRef}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
