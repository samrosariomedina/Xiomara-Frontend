"use client"

import { useTranslations } from 'next-intl'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { brandGuidesSchema, type BrandGuidesInput } from '@/lib/formSchemas'
import { useEffect, forwardRef, useImperativeHandle } from "react"

interface BrandGuidesFormProps {
  onFormValid?: (isValid: boolean) => void;
  onDataChange?: (data: BrandGuidesInput) => void;
  initialData?: Partial<BrandGuidesInput>;
}

export const BrandGuidesForm = forwardRef(function BrandGuidesForm({ 
  onFormValid, 
  onDataChange,
  initialData 
}: BrandGuidesFormProps, ref) {
  const t = useTranslations('CLIENT_FORM');
  
  const form = useForm<BrandGuidesInput>({
    resolver: zodResolver(brandGuidesSchema),
    defaultValues: initialData || {},
    mode: "onChange"
  });
  
  const { formState: { isValid }, watch } = form;
  
  // Watch for form validity changes and notify parent
  useEffect(() => {
    if (onFormValid) {
      onFormValid(isValid);
    }
  }, [isValid, onFormValid]);
  
  // Watch all form values and notify parent on change using subscription
  useEffect(() => {
    // Set up a subscription to form changes
    const subscription = watch((value) => {
      if (onDataChange) {
        onDataChange(value as BrandGuidesInput);
      }
    });
    
    // Cleanup the subscription on unmount
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  useImperativeHandle(ref, () => ({
    validate: async () => {
      return await form.trigger();
    },
    getValues: () => form.getValues() as BrandGuidesInput
  }))

  return (
    <div className="space-y-4 mt-6">
      <div className="border border-gray-100 rounded-lg p-6 bg-white">
        <div className="text-center py-8">
          <p className="text-gray-500">{t('brand.comingSoon') || 'Brand Guides content coming soon...'}</p>
        </div>
      </div>
    </div>
  );
});
