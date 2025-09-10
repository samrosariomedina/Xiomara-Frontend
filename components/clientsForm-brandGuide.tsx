"use client"

import { useTranslations } from 'next-intl'
import { type BrandGuidesInput } from '@/lib/schemas'
import { forwardRef, useImperativeHandle } from "react"

interface BrandGuidesFormProps {
  // Brand guides form is currently empty and always valid
}

type ChildFormRef<T = unknown> = {
  validate: () => Promise<boolean>
  getValues: () => T
}

export const BrandGuidesForm = forwardRef<ChildFormRef<BrandGuidesInput>, BrandGuidesFormProps>(function BrandGuidesForm(
  _props,
  ref
) {
  const t = useTranslations('CLIENT_FORM');

  // Since brand guides are not implemented yet, always return empty data
  useImperativeHandle(ref, () => ({
    validate: async () => {
      return true; // Always valid since it's not implemented
    },
    getValues: () => ({}) as BrandGuidesInput
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
