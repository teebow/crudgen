import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  itemName: string;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({
  isOpen,
  onOpenChange,
  itemName,
  onConfirm,
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Confirm Deletion
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="rounded-full bg-danger-100 p-3">
                  <Icon
                    icon="lucide:alert-triangle"
                    className="h-6 w-6 text-danger"
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">
                    Are you sure you want to delete this item?
                  </p>
                  {itemName && (
                    <p className="mt-1 text-default-500">
                      <span className="font-medium">{itemName}</span> will be
                      permanently removed.
                    </p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
