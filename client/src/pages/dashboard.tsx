import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import TabulatorTable from "@/components/tabulator-table";
import Charts from "@/components/charts";
import CurrencyConverterModal from "@/components/currency-converter-modal";
import AddLetterModal from "@/components/add-letter-modal";
import AddCreditModal from "@/components/add-credit-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";
import { 
  File, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Download,
  Globe,
  ChartPie,
  Table,
  Calendar,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isAddLetterModalOpen, setIsAddLetterModalOpen] = useState(false);
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const { selectedCurrency, formatCurrency } = useCurrency();

  // Mock exchange rates for now
  const exchangeRates = {
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    IQD: 0.0007,
    GBP: 40.8,
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard-stats'],
  });

  const { data: letters, isLoading: lettersLoading } = useQuery({
    queryKey: ['/api/guarantee-letters'],
  });

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/credits'],
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: banks } = useQuery({
    queryKey: ['/api/banks'],
  });

  const handleExportExcel = async () => {
    if (letters && Array.isArray(letters)) {
      await exportToExcel(letters, 'teminat-mektuplari.xlsx');
    }
  };

  const handleExportPDF = async () => {
    if (letters && Array.isArray(letters)) {
      await exportToPDF(letters, 'teminat-mektuplari.pdf');
    }
  };

  if (statsLoading || lettersLoading || creditsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        projects={Array.isArray(projects) ? projects : []}
        banks={Array.isArray(banks) ? banks : []}
        selectedProjects={selectedProjects}
        selectedBanks={selectedBanks}
        onProjectsChange={setSelectedProjects}
        onBanksChange={setSelectedBanks}
        onCurrencyModalOpen={() => setIsCurrencyModalOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Globe className="w-4 h-4 mr-2" />
                {selectedCurrency}
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={() => setIsAddLetterModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Mektup
              </Button>
              <Button variant="outline" onClick={handleExportExcel} className="bg-green-600 text-white hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Dışa Aktar
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
                <ChartPie className="w-4 h-4 mr-2" />
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger value="letters" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
                <Table className="w-4 h-4 mr-2" />
                Mektup Listesi
              </TabsTrigger>
              <TabsTrigger value="credits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                Kullanılan Krediler
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
                <Calendar className="w-4 h-4 mr-2" />
                Ödeme Takvimi
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
                <BarChart3 className="w-4 h-4 mr-2" />
                Raporlar
              </TabsTrigger>
            </TabsList>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="overview" className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                          <File className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Toplam Mektup</p>
                          <p className="text-2xl font-semibold text-gray-900">{(stats as any)?.totalLetters || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Toplam Tutar</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {formatCurrency((stats as any)?.totalLetterAmount || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Yaklaşan Ödemeler</p>
                          <p className="text-2xl font-semibold text-gray-900">{(stats as any)?.upcomingPayments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Geciken Ödemeler</p>
                          <p className="text-2xl font-semibold text-gray-900">{(stats as any)?.overduePayments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <Charts letters={letters || []} />
              </TabsContent>

              <TabsContent value="letters">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">Teminat Mektupları</h3>
                    </div>
                    <TabulatorTable 
                      data={letters || []} 
                      selectedCurrency={selectedCurrency}
                      exchangeRates={exchangeRates}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="credits">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">Kullanılan Krediler</h3>
                      <Button onClick={() => setIsAddCreditModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Kredi
                      </Button>
                    </div>

                    <TabulatorTable 
                      data={credits || []} 
                      selectedCurrency={selectedCurrency}
                      exchangeRates={exchangeRates}
                      isCredits={true}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ödeme Takvimi</h3>
                        <div className="h-96 border border-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p>Takvim görünümü yakında eklenecek</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Yaklaşan Ödemeler</h3>
                        <div className="space-y-3">
                          {letters?.filter(letter => {
                            if (!letter.expiryDate) return false;
                            const expiryDate = new Date(letter.expiryDate);
                            const today = new Date();
                            const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                            return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
                          }).map(payment => (
                            <div key={payment.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">{payment.bank?.name}</span>
                                <Badge variant="outline" className="text-yellow-700 bg-yellow-100">
                                  {payment.expiryDate ? 
                                    Math.ceil((new Date(payment.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                                  } gün
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{payment.project?.name}</p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatCurrency(parseFloat(payment.letterAmount || '0'))}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reports">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dışa Aktarma Seçenekleri</h3>
                      <div className="flex items-center space-x-4">
                        <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700">
                          <Download className="w-4 h-4 mr-2" />
                          Excel Olarak İndir
                        </Button>
                        <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700">
                          <Download className="w-4 h-4 mr-2" />
                          PDF Olarak İndir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Charts letters={letters || []} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <CurrencyConverterModal 
        open={isCurrencyModalOpen}
        onOpenChange={setIsCurrencyModalOpen}
      />

      <AddLetterModal
        open={isAddLetterModalOpen}
        onOpenChange={setIsAddLetterModalOpen}
      />

      <AddCreditModal
        open={isAddCreditModalOpen}
        onOpenChange={setIsAddCreditModalOpen}
      />
    </div>
  );
}
