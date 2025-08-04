import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Building2, FolderOpen, ArrowRightLeft, Plus, Settings } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import type { Project, Bank } from "@shared/schema";
import AddProjectModal from "./add-project-modal";
import AddBankModal from "./add-bank-modal";
import ManageProjectsModal from "./manage-projects-modal";
import ManageBanksModal from "./manage-banks-modal";

interface SidebarProps {
  projects: Project[];
  banks: Bank[];
  selectedProjects: string[];
  selectedBanks: string[];
  onProjectsChange: (projectIds: string[]) => void;
  onBanksChange: (bankIds: string[]) => void;
  onCurrencyModalOpen: () => void;
}

export default function Sidebar({
  projects,
  banks,
  selectedProjects,
  selectedBanks,
  onProjectsChange,
  onBanksChange,
  onCurrencyModalOpen
}: SidebarProps) {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isBanksExpanded, setIsBanksExpanded] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isManageProjectsOpen, setIsManageProjectsOpen] = useState(false);
  const [isManageBanksOpen, setIsManageBanksOpen] = useState(false);
  const { selectedCurrency, setSelectedCurrency, currencies } = useCurrency();

  const handleProjectChange = (projectId: string, checked: boolean) => {
    if (checked) {
      onProjectsChange([...selectedProjects, projectId]);
    } else {
      onProjectsChange(selectedProjects.filter(id => id !== projectId));
    }
  };

  const handleBankChange = (bankId: string, checked: boolean) => {
    if (checked) {
      onBanksChange([...selectedBanks, bankId]);
    } else {
      onBanksChange(selectedBanks.filter(id => id !== bankId));
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Teminat Mektubu Takip</h1>
        <p className="text-sm text-gray-500 mt-1">Kredi ve Teminat Yönetimi</p>
      </div>

      {/* Currency Converter */}
      <div className="p-4 border-b border-gray-200 bg-yellow-50">
        <h3 className="font-medium text-gray-700 mb-3">
          <ArrowRightLeft className="inline w-4 h-4 mr-2" />
          Kur Çevirici
        </h3>
        <div className="space-y-2">
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={onCurrencyModalOpen}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            Kur Katsayıları Düzenle
          </Button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">
            <FolderOpen className="inline w-4 h-4 mr-2" />
            Projeler
          </h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProjectModalOpen(true)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Yeni Proje Ekle"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsManageProjectsOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Projeleri Yönet"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
            >
              {isProjectsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {isProjectsExpanded && (
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`project-${project.id}`}
                  checked={selectedProjects.includes(project.id)}
                  onCheckedChange={(checked) => 
                    handleProjectChange(project.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`project-${project.id}`}
                  className="text-sm text-gray-600 flex-1 cursor-pointer"
                >
                  {project.name}
                </label>
                <Badge variant="secondary" className="text-xs">
                  {/* This would show letter count - implement when available */}
                  0
                </Badge>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="text-sm text-gray-500 italic">Proje bulunamadı</div>
            )}
          </div>
        )}
      </div>

      {/* Banks Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">
            <Building2 className="inline w-4 h-4 mr-2" />
            Bankalar
          </h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBankModalOpen(true)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Yeni Banka Ekle"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsManageBanksOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Bankaları Yönet"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBanksExpanded(!isBanksExpanded)}
            >
              {isBanksExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {isBanksExpanded && (
          <div className="space-y-2">
            {banks.map(bank => (
              <div key={bank.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`bank-${bank.id}`}
                  checked={selectedBanks.includes(bank.id)}
                  onCheckedChange={(checked) => 
                    handleBankChange(bank.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`bank-${bank.id}`}
                  className="text-sm text-gray-600 flex-1 cursor-pointer"
                >
                  {bank.name}
                </label>
                <Badge variant="secondary" className="text-xs">
                  {/* This would show letter count - implement when available */}
                  0
                </Badge>
              </div>
            ))}
            {banks.length === 0 && (
              <div className="text-sm text-gray-500 italic">Banka bulunamadı</div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddProjectModal 
        open={isProjectModalOpen} 
        onOpenChange={setIsProjectModalOpen} 
      />
      <AddBankModal 
        open={isBankModalOpen} 
        onOpenChange={setIsBankModalOpen} 
      />
      <ManageProjectsModal 
        open={isManageProjectsOpen} 
        onOpenChange={setIsManageProjectsOpen} 
      />
      <ManageBanksModal 
        open={isManageBanksOpen} 
        onOpenChange={setIsManageBanksOpen} 
      />
    </div>
  );
}
