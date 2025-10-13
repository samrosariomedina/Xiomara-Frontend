"use client"

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

import { createCampaignSchema, CreateCampaignInput } from "@/lib/schemas";
import { createCampaignAction } from "@/actions/campaigns";

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

export function CreateCampaignDialog({
  isOpen,
  onClose,
  clientId,
  clientName,
}: CreateCampaignDialogProps) {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: "",
      type: "Comunicado",
      startDate: "",
      description: "",
    },
  });

  const campaignType = watch("type");

  const onSubmit = async (data: CreateCampaignInput) => {
    try {
      const result = await createCampaignAction(clientId, data);

      if (result.success) {
        toast.success('Campaign created successfully!');
        // Close dialog and reset form on success
        onClose();
        reset();
        // Refresh the page to show the new campaign
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error('Failed to create campaign');
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
          <DialogTitle className="text-gray-900 font-semibold">Create New Campaign</DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new campaign for client: <strong className="text-gray-900">{clientName}</strong>
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
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
