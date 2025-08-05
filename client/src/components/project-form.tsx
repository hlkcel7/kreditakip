import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type ProjectFormData = z.infer<typeof insertProjectSchema>;

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  isPending?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function ProjectForm({ initialValues, onSubmit, isPending, submitLabel = "Kaydet", onCancel }: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      status: initialValues?.status ?? "active",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proje Adı</FormLabel>
              <FormControl>
                <Input placeholder="Proje adını girin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="Proje açıklaması..." rows={3} {...field} value={field.value ?? ""} />
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
              <FormControl>
                <Input placeholder="Durum (örn: active, passive)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
