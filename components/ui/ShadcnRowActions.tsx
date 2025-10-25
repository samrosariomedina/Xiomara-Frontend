  "use client"

import { useState } from "react"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ShadcnRowActionsProps {
  onEdit?: () => void | Promise<void>
  onDelete?: () => void | Promise<void>
  itemName?: string
  itemType: "Client" | "Campaign" | "Source" | "Knowledge" | "Corresponsable" | "Media"
  children?: React.ReactNode
  showTrigger?: boolean
  className?: string
}

export function ShadcnRowActions({
  onEdit,
  onDelete,
  itemName = '',
  itemType,
  children,
  showTrigger = true,
  className = ""
}: ShadcnRowActionsProps) {
  const [isEditLoading, setIsEditLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleEdit = async () => {
    if (!onEdit) return
    try {
      setIsEditLoading(true)
      await Promise.resolve(onEdit())
      setPopoverOpen(false) // Close popover after edit
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      setIsDeleteLoading(true)
      await Promise.resolve(onDelete())
    } finally {
      setIsDeleteLoading(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleDeleteClick = () => {
    setPopoverOpen(false) // Close popover when delete is clicked
    setDeleteDialogOpen(true)
  }

  const triggerButton = children || (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  )

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          {showTrigger ? triggerButton : children}
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1 bg-white" align="end">
          <div className="flex flex-col space-y-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit()
                }}
                disabled={isEditLoading}
                className="justify-start h-8 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditLoading ? 'Editing...' : `Edit ${itemType}`}
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick()
                }}
                disabled={isDeleteLoading}
                className="justify-start h-8 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Delete {itemType}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to delete <strong>&quot;{itemName}&quot;</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDialogOpen(false)
              }}
              disabled={isDeleteLoading}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isDeleteLoading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
