"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createCampaignSchema, editCampaignSchema, CreateCampaignInput, EditCampaignInput } from "@/lib/schemas";
import { createCampaignAction, editCampaignAction } from "@/actions/campaigns";

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  editCampaign?: {
    id: string;
    name: string;
    type: string;
    startDate: string;
    description?: string;
  } | null;
  onSuccess?: () => void;
}

export function CreateCampaignDialog({
  isOpen,
  onClose,
  clientId,
  clientName,
  editCampaign = null,
  onSuccess,
}: CreateCampaignDialogProps) {
  const isEditMode = !!editCampaign;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateCampaignInput | EditCampaignInput>({
    resolver: zodResolver(isEditMode ? editCampaignSchema : createCampaignSchema),
    defaultValues: {
      name: editCampaign?.name || "",
      type: (editCampaign?.type || "Comunicado") as CreateCampaignInput["type"],
      startDate: editCampaign?.startDate || new Date().toISOString().split('T')[0],
      description: editCampaign?.description || "",
    },
  });

  const campaignType = watch("type");

  // Update form when editCampaign changes
  React.useEffect(() => {
    if (editCampaign) {
      reset({
        name: editCampaign.name,
        type: editCampaign.type as CreateCampaignInput["type"],
        startDate: editCampaign.startDate,
        description: editCampaign.description || "",
      });
    } else {
      reset({
        name: "",
        type: "Comunicado",
        startDate: new Date().toISOString().split('T')[0],
        description: "",
      });
    }
  }, [editCampaign, reset]);

  const onSubmit = async (data: CreateCampaignInput | EditCampaignInput) => {
    try {
      const result = isEditMode
        ? await editCampaignAction(editCampaign!.id, data)
        : await createCampaignAction(clientId, data);

      if (result.success) {
        toast.success(isEditMode ? 'Campaign updated successfully!' : 'Campaign created successfully!');
        // Close dialog and reset form on success
        onClose();
        reset();
        // Call onSuccess callback if provided
        onSuccess?.();
        // The page will automatically refresh due to revalidatePath in the action
      } else {
        toast.error(result.error || (isEditMode ? 'Failed to update campaign' : 'Failed to create campaign'));
      }
    } catch (error) {
      console.error(isEditMode ? "Failed to update campaign:" : "Failed to create campaign:", error);
      toast.error(isEditMode ? 'Failed to update campaign' : 'Failed to create campaign');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const campaignTypes = [
    { value: "Comunicado", label: "Comunicado (press release)" },
    { value: "Redes Sociales", label: "Redes Sociales (social media)" },
    { value: "Blog post", label: "Blog post" },
    { value: "Email newsletter", label: "Email newsletter" },
    { value: "Other", label: "Other" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900 font-semibold">
            {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEditMode 
              ? `Edit campaign details for: ${clientName}` 
              : <>Create a new campaign for client: <strong className="text-gray-900">{clientName}</strong></>
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">Campaign Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter campaign name"
              disabled={isSubmitting}
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Campaign Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-700 font-medium">Campaign Type *</Label>
            <Select
              value={campaignType}
              onValueChange={(value: string) => setValue("type", value as CreateCampaignInput["type"])}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {campaignTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-gray-900 hover:bg-gray-100">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-gray-700 font-medium">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              disabled={isSubmitting}
              className="bg-white border-gray-300 text-gray-900"
            />
            {errors.startDate && (
              <p className="text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter campaign description..."
              rows={3}
              disabled={isSubmitting}
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting 
                ? (isEditMode ? "Updating..." : "Creating...") 
                : (isEditMode ? "Update Campaign" : "Create Campaign")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
