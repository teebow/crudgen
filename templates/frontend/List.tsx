import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  useDisclosure,
  Pagination,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Tooltip
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { DeleteConfirmModal } from "./delete-confirm-modal";


export const CrudManager = () => {
  
  // Modal states
  const { isOpen: isItemModalOpen, onOpen: onItemModalOpen, onOpenChange: onItemModalOpenChange } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalOpenChange } = useDisclosure();
  
  // Current item being edited or deleted
  const [currentItem, setCurrentItem] = React.useState<Item | null>(null);

  // Define fields configuration for the modal
  const itemFields = [
    {
      name: "name" as keyof Item,
      label: "Name",
      placeholder: "Enter item name",
      type: "text" as const,
      required: true,
      requiredMessage: "Name is required"
    },
    {
      name: "category" as keyof Item,
      label: "Category",
      placeholder: "Enter category",
      type: "text" as const,
      required: true,
      requiredMessage: "Category is required"
    },
    {
      name: "status" as keyof Item,
      label: "Status",
      placeholder: "Select status",
      type: "select" as const,
      options: [
        { key: "active", label: "Active" },
        { key: "inactive", label: "Inactive" },
        { key: "pending", label: "Pending" }
      ],
      required: true,
      requiredMessage: "Status is required"
    }
  ];

  // Handle edit button click
  const handleEdit = (item: Item) => {
    setCurrentItem(item);
    //onItemModalOpen();
  };

  // Handle delete button click
  const handleDelete = (item: Item) => {
    setCurrentItem(item);
    onDeleteModalOpen();
  };

  // Handle add new item button click
  const handleAddNew = () => {
    setCurrentItem(null);
    onItemModalOpen();
  };

  // Handle item save (create or update)
  const handleSaveItem = (item: Item) => {
    if (currentItem) {
      updateItem(item);
    } else {
      addItem(item);
    }
  };

  // Handle item deletion confirmation
  const handleDeleteConfirm = () => {
    if (currentItem) {
      deleteItem(currentItem.id);
      setCurrentItem(null);
    }
  };

  // Status color mapping
  const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
    active: "success",
    inactive: "danger",
    pending: "warning",
  };

  // Render the status cell with appropriate styling
  const renderStatusCell = (status: string) => {
    return (
      <Chip 
        color={statusColorMap[status]} 
        size="sm" 
        variant="flat"
      >
        {status}
      </Chip>
    );
  };

  // Render the actions cell with edit and delete buttons
  const renderActionsCell = (item: Item) => {
    return (
      <div className="flex items-center gap-2">
        <Tooltip content="Edit">
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            onPress={() => handleEdit(item)}
          >
            <Icon icon="lucide:edit" className="text-lg" />
          </Button>
        </Tooltip>
        <Tooltip content="Delete" color="danger">
          <Button 
            isIconOnly 
            size="sm" 
            variant="light" 
            color="danger" 
            onPress={() => handleDelete(item)}
          >
            <Icon icon="lucide:trash-2" className="text-lg" />
          </Button>
        </Tooltip>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with search and add button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-1 items-center gap-2 md:max-w-md">
          <Input
            isClearable
            placeholder="Search by name..."
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            value={filterValue}
            onValueChange={setFilterValue}
            className="w-full"
          />
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                endContent={<Icon icon="lucide:chevron-down" className="text-small" />}
              >
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filter by status"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
            >
              <DropdownItem key="active">Active</DropdownItem>
              <DropdownItem key="inactive">Inactive</DropdownItem>
              <DropdownItem key="pending">Pending</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <Button 
          color="primary" 
          onPress={handleAddNew}
          startContent={<Icon icon="lucide:plus" />}
        >
          Add New
        </Button>
      </div>

      {/* Data table */}
      <div className="rounded-medium border border-default-200">
        <Table
          removeWrapper
          aria-label="Data table with sorting and pagination"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          }
        >
          <TableHeader>
            <TableColumn key="name" allowsSorting>Name</TableColumn>
            <TableColumn key="category" allowsSorting>Category</TableColumn>
            <TableColumn key="status" allowsSorting>Status</TableColumn>
            <TableColumn key="createdAt" allowsSorting>Created At</TableColumn>
            <TableColumn key="actions">Actions</TableColumn>
          </TableHeader>
          <TableBody 
            emptyContent="No items found"
            items={filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{renderStatusCell(item.status)}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell>{renderActionsCell(item)}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Item modal for create/edit */}
      <ItemModal<Item>
        isOpen={isItemModalOpen}
        onOpenChange={onItemModalOpenChange}
        item={currentItem}
        onSave={handleSaveItem}
        fields={itemFields}
        title={{
          create: "Add New Item",
          edit: "Edit Item"
        }}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalOpenChange}
        itemName={currentItem?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};