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

const formSchema = z.object({
  // Sayısal alanlar
  contractAmount: z.string()
    .min(1, "Sözleşme tutarı gerekli")
    .transform((val) => Number(parseFloat(val).toFixed(2))),
  letterPercentage: z.string()
    .min(1, "Mektup yüzdesi gerekli")
    .transform((val) => Number(parseFloat(val).toFixed(2))),
  letterAmount: z.string()
    .min(1, "Mektup tutarı gerekli")
    .transform((val) => Number(parseFloat(val).toFixed(2))),
  commissionRate: z.string()
    .min(1, "Komisyon oranı gerekli")
    .transform((val) => Number(parseFloat(val).toFixed(2))),
  bsmvAndOtherCosts: z.string()
    .default("0")
    .transform((val) => Number(parseFloat(val || "0").toFixed(2))),
  
  // Tarih alanları
  purchaseDate: z.date({
    required_error: "Mektup alım tarihi gerekli",
    invalid_type_error: "Geçerli bir tarih giriniz",
  }),
  expiryDate: z.date({
    invalid_type_error: "Geçerli bir tarih giriniz",
  }).nullable(),
  
  // String alanlar
  bankId: z.string().min(1, "Banka seçimi gerekli"),
  projectId: z.string().min(1, "Proje seçimi gerekli"),
  status: z.string().min(1, "Durum seçimi gerekli"),
  letterType: z.string().min(1, "Mektup türü seçimi gerekli"),
  currency: z.string().min(1, "Para birimi seçimi gerekli"),
  notes: z.string().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface AddLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<FieldType>;
  isEditing?: boolean;
}

type FieldType = {
  // Sayısal alanlar (form'da string olarak tutulacak)
  contractAmount: string;
  letterPercentage: string;
  letterAmount: string;
  commissionRate: string;
  bsmvAndOtherCosts: string;
  
  // Tarih alanları
  purchaseDate: Date;
  expiryDate: Date | null;
  
  // String alanlar
  bankId: string;
  projectId: string;
  status: string;
  letterType: string;
  currency: string;
  notes: string;
};

export default function AddLetterModal({ open, onOpenChange, initialValues, isEditing = false }: AddLetterModalProps) {
  const { toast } = useToast();

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
    enabled: open,
  });

  const { data: banks } = useQuery({
    queryKey: ['/api/banks'],
    enabled: open,
  });

  const form = useForm<FieldType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // String alanlar
      letterType: initialValues?.letterType ?? "",
      currency: initialValues?.currency ?? "TRY",
      status: initialValues?.status ?? "aktif",
      projectId: initialValues?.projectId ?? "",
      bankId: initialValues?.bankId ?? "",
      notes: initialValues?.notes ?? "",
      
      // Sayısal alanlar (string olarak)
      contractAmount: initialValues?.contractAmount?.toString() ?? "0",
      letterPercentage: initialValues?.letterPercentage?.toString() ?? "0",
      letterAmount: initialValues?.letterAmount?.toString() ?? "0",
      commissionRate: initialValues?.commissionRate?.toString() ?? "0",
      bsmvAndOtherCosts: initialValues?.bsmvAndOtherCosts?.toString() ?? "0",
      
      // Tarih alanları
      purchaseDate: initialValues?.purchaseDate ? new Date(initialValues.purchaseDate) : new Date(),
      expiryDate: initialValues?.expiryDate ? new Date(initialValues.expiryDate) : null,
    },
  });

  const letterMutation = useMutation({
    mutationFn: async (data: FieldType) => {
      // Form verilerini API'ye göndermeden önce sayısal değerlere dönüştür
      const submitData = {
        ...data,
        contractAmount: Number(parseFloat(data.contractAmount || "0").toFixed(2)),
        letterPercentage: Number(parseFloat(data.letterPercentage || "0").toFixed(2)),
        letterAmount: Number(parseFloat(data.letterAmount || "0").toFixed(2)),
        commissionRate: Number(parseFloat(data.commissionRate || "0").toFixed(2)),
        bsmvAndOtherCosts: Number(parseFloat(data.bsmvAndOtherCosts || "0").toFixed(2)),
        purchaseDate: data.purchaseDate,
        expiryDate: data.expiryDate
      };
      
      const method = isEditing ? 'PATCH' : 'POST';
      const url = isEditing 
        ? `/api/guarantee-letters/${initialValues?.id}`
        : '/api/guarantee-letters';
        
      const response = await apiRequest(method, url, submitData);
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

  const onSubmit = (data: FieldType) => {
    letterMutation.mutate(data);
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
          <DialogTitle>
            {isEditing ? 'Teminat Mektubu Düzenle' : 'Yeni Teminat Mektubu Ekle'}
          </DialogTitle>
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
                      <Input 
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          field.onChange(e.target.value ? new Date(e.target.value) : null);
                        }}
                      />
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
                      <Input 
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          field.onChange(e.target.value ? new Date(e.target.value) : null);
                        }}
                      />
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
                    <Textarea placeholder="Ek notlar..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={letterMutation.isPending}>
                {letterMutation.isPending ? "Kaydediliyor..." : (isEditing ? "Güncelle" : "Kaydet")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
