import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertGuaranteeLetterSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertGuaranteeLetterSchema.extend({
  contractAmount: z.string().transform(val => val.toString()),
  letterPercentage: z.string().transform(val => val.toString()),
  letterAmount: z.string().transform(val => val.toString()),
  commissionRate: z.string().transform(val => val.toString()),
  bsmvAndOtherCosts: z.string().transform(val => val.toString()),
});

type FormData = z.infer<typeof formSchema>;

interface AddLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddLetterModal({ open, onOpenChange }: AddLetterModalProps) {
  const { toast } = useToast();

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: open,
  });

  const { data: banks } = useQuery({
    queryKey: ['/api/banks'],
    enabled: open,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      letterType: "",
      contractAmount: "",
      letterPercentage: "",
      letterAmount: "",
      commissionRate: "",
      bsmvAndOtherCosts: "0",
      currency: "TRY",
      purchaseDate: "",
      letterDate: "",
      status: "aktif",
      notes: "",
    },
  });

  const createLetterMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Calculate letter amount if not provided
      const contractAmount = parseFloat(data.contractAmount);
      const percentage = parseFloat(data.letterPercentage);
      const calculatedAmount = (contractAmount * percentage) / 100;
      
      const response = await apiRequest('POST', '/api/guarantee-letters', {
        ...data,
        contractAmount: data.contractAmount,
        letterPercentage: data.letterPercentage,
        letterAmount: data.letterAmount || calculatedAmount.toString(),
        commissionRate: data.commissionRate,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guarantee-letters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Başarılı",
        description: "Teminat mektubu eklendi",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Teminat mektubu eklenemedi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createLetterMutation.mutate(data);
  };

  // Calculate letter amount when contract amount or percentage changes
  const contractAmount = form.watch("contractAmount");
  const letterPercentage = form.watch("letterPercentage");

  const calculateLetterAmount = () => {
    if (contractAmount && letterPercentage) {
      const amount = (parseFloat(contractAmount) * parseFloat(letterPercentage)) / 100;
      form.setValue("letterAmount", amount.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Teminat Mektubu Ekle</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mektup Veren Banka</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Banka Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(banks) && banks.map((bank: any) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letterType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mektup Türü</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tür Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="teminat">Teminat Mektubu</SelectItem>
                        <SelectItem value="avans">Avans Teminat Mektubu</SelectItem>
                        <SelectItem value="kesin-teminat">Kesin Teminat Mektubu</SelectItem>
                        <SelectItem value="gecici-teminat">Geçici Teminat Mektubu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proje</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Proje Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.isArray(projects) && projects.map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para Birimi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                        <SelectItem value="USD">USD - Amerikan Doları</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="IQD">IQD - Irak Dinarı</SelectItem>
                        <SelectItem value="GBP">GBP - İngiliz Sterlini</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proje Sözleşme Tutarı</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        onBlur={calculateLetterAmount}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letterPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mektup Tutarı (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="5.00" 
                        {...field}
                        onBlur={calculateLetterAmount}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letterAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mektup Tutarı</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komisyon Oranı (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="1.50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bsmvAndOtherCosts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BSMV ve Diğer Masraflar</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mektup Alım Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letterDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mektup Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Son Geçerlilik Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="beklemede">Beklemede</SelectItem>
                        <SelectItem value="kapali">Kapalı</SelectItem>
                        <SelectItem value="iptal">İptal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notlar</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ek notlar..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={createLetterMutation.isPending}>
                {createLetterMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
