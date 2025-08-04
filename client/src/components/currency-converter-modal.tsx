import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useCurrency } from "@/hooks/use-currency";

interface CurrencyConverterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CurrencyConverterModal({ open, onOpenChange }: CurrencyConverterModalProps) {
  const [sourceCurrency, setSourceCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("TRY");
  const [exchangeRate, setExchangeRate] = useState("");
  const { toast } = useToast();
  const { currencies } = useCurrency();

  const { data: rates } = useQuery({
    queryKey: ['/api/exchange-rates'],
    enabled: open,
  });

  const saveRateMutation = useMutation({
    mutationFn: async (data: { fromCurrency: string; toCurrency: string; rate: string }) => {
      const response = await apiRequest('POST', '/api/exchange-rates', {
        fromCurrency: data.fromCurrency,
        toCurrency: data.toCurrency,
        rate: data.rate,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exchange-rates'] });
      toast({
        title: "Başarılı",
        description: "Kur katsayısı kaydedildi",
      });
      setExchangeRate("");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kur katsayısı kaydedilemedi",
        variant: "destructive",
      });
    },
  });

  const handleSaveRate = () => {
    if (!sourceCurrency || !targetCurrency || !exchangeRate) {
      toast({
        title: "Hata",
        description: "Tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    saveRateMutation.mutate({
      fromCurrency: sourceCurrency,
      toCurrency: targetCurrency,
      rate: exchangeRate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kur Katsayıları Yönetimi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sourceCurrency">Kaynak Para Birimi</Label>
              <Select value={sourceCurrency} onValueChange={setSourceCurrency}>
                <SelectTrigger>
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
            </div>
            
            <div>
              <Label htmlFor="targetCurrency">Hedef Para Birimi</Label>
              <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                <SelectTrigger>
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
            </div>
            
            <div>
              <Label htmlFor="exchangeRate">Katsayı</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="1.0000"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveRate} 
            disabled={saveRateMutation.isPending}
            className="w-full"
          >
            {saveRateMutation.isPending ? "Kaydediliyor..." : "Katsayı Ekle/Güncelle"}
          </Button>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-700 mb-3">Mevcut Kur Katsayıları</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rates?.map((rate: any) => (
                  <div key={rate.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <span className="text-sm font-medium">
                      {rate.fromCurrency}/{rate.toCurrency}
                    </span>
                    <span className="text-sm text-gray-600">
                      {parseFloat(rate.rate).toFixed(4)}
                    </span>
                  </div>
                ))}
                {(!rates || rates.length === 0) && (
                  <div className="text-sm text-gray-500 italic col-span-2">
                    Henüz kur katsayısı tanımlanmamış
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
