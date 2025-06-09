import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { Item } from "./crud-manager";
import { useForm, Controller } from "react-hook-form";

interface ItemModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  item: Item | null;
  onSave: (item: Item) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onOpenChange,
  item,
  onSave,
}) => {
  // Replace form state with React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<Item>>({
    defaultValues: {
      name: "",
      category: "",
      status: "active",
    },
  });

  // Reset form when modal opens/closes or item changes
  React.useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          name: item.name,
          category: item.category,
          status: item.status,
        });
      } else {
        reset({
          name: "",
          category: "",
          status: "active",
        });
      }
    }
  }, [isOpen, item, reset]);

  // Handle form submission
  const onSubmit = (data: Partial<Item>) => {
    const currentDate = new Date().toISOString();
    const savedItem: Item = {
      id: item?.id || `item-${Date.now()}`,
      name: data.name!,
      category: data.category!,
      status: data.status as "active" | "inactive" | "pending",
      createdAt: item?.createdAt || currentDate,
    };

    onSave(savedItem);
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {item ? "Edit Item" : "Add New Item"}
            </ModalHeader>
            <ModalBody>
             
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" form="item-form">
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
