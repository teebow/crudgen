import { pascalCase } from "change-case";
import { FormSchema } from "./generate-inputs";

export function generateList(entityName: string, schema: FormSchema): string {
  const entityCapitalized = pascalCase(entityName);
  const entityLower = entityName.toLowerCase();

  //generate table columns based on schema fields
  const tableColumns = schema.fields
    .map((field) => {
      if (field.name === "id") return null; // Skip ID field
      return `<TableColumn key="${field.name}" allowsSorting>
        ${field.label || field.name}
      </TableColumn>`;
    })
    .filter(Boolean)
    .join("\n");
  // Generate table cells for each field
  const tableCells = schema.fields
    .map((field) => {
      if (field.name === "id") return null; // Skip ID field
      return `<TableCell>
        {${entityLower}.${field.name}}
      </TableCell>`;
    })
    .filter(Boolean)
    .join("\n");

  const code = `import React from "react";
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
  Tooltip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { DeleteConfirmModal } from "@components/DeleteModale";
import type { ${entityCapitalized}Dto } from "@dto/${entityLower}/dto/${entityLower}.dto";
import { useData } from "@core/context/use-data";
import CustomDrawer from "@components/Drawer";
import ${entityCapitalized}Page from "./${entityCapitalized}Page";

export const ${entityCapitalized}List = () => {
  // Modal states
  const {
    isOpen: isItemDrawerOpen,
    onOpen: onItemDrawerOpen,
    onOpenChange: onItemDrawerOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalOpenChange,
  } = useDisclosure();

  // Current ${entityLower} being edited or deleted
  const [currentItem, setCurrentItem] = React.useState<${entityCapitalized}Dto | null>(null);

  const { ${entityLower} } = useData();
  const { data: ${entityLower}List, isLoading } = ${entityLower}.useList();
  const { mutateAsync: delete${entityCapitalized}  } = ${entityLower}.useDelete();

  // Handle edit button click
  const handleEdit = (${entityLower}: ${entityCapitalized}Dto) => {
    setCurrentItem(${entityLower});
    onItemDrawerOpen();
  };

  // Handle delete button click
  const handleDelete = (${entityLower}: ${entityCapitalized}Dto) => {
    setCurrentItem(${entityLower});
    onDeleteModalOpen();
  };

  // Handle add new ${entityLower} button click
  const handleAddNew = () => {
    setCurrentItem(null);
    onItemDrawerOpen();
  };

  // Handle ${entityLower} save (create or update)
  const handleSaveItem = (${entityLower}: ${entityCapitalized}Dto) => {
    if (currentItem) {
      //updateItem(${entityLower});
    } else {
      //addItem(${entityLower});
    }
  };

  // Handle ${entityLower} deletion confirmation
  const handleDeleteConfirm = async () => {
    if (currentItem) {
      await delete${entityCapitalized}(currentItem.id);
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
      <Chip color={statusColorMap[status]} size="sm" variant="flat">
        {status}
      </Chip>
    );
  };

  // Render the actions cell with edit and delete buttons
  const renderActionsCell = (${entityLower}: ${entityCapitalized}Dto) => {
    return (
      <div className="flex items-center gap-2">
        <Tooltip content="Edit">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => handleEdit(${entityLower})}
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
            onPress={() => handleDelete(${entityLower})}
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
            startContent={
              <Icon icon="lucide:search" className="text-default-400" />
            }
            className="w-full"
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                endContent={
                  <Icon icon="lucide:chevron-down" className="text-small" />
                }
              >
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filter by status"
              closeOnSelect={false}
              selectionMode="multiple"
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
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={1}
                total={1}
                onChange={() => {}}
              />
            </div>
          }
        >
          <TableHeader>
            ${tableColumns}
            <TableColumn key="actions">Actions</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent="No items found"
            items={${entityLower}List ?? []}
            isLoading={isLoading}
            loadingContent={<Spinner label="Loading..." />}
          >
            {(${entityLower}: ${entityCapitalized}Dto) => (
              <TableRow key={${entityLower}.id}>
                ${tableCells}
                <TableCell>{renderActionsCell(${entityLower})}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Item modal for create/edit */}
      {/* <ItemModal<Item>
        isOpen={isItemModalOpen}
        onOpenChange={onItemModalOpenChange}
        ${entityLower}={currentItem}
        onSave={handleSaveItem}
        fields={itemFields}
        title={{
          create: "Add New Item",
          edit: "Edit Item"
        }}
      /> */}

     
      <CustomDrawer
              isOpen={isItemDrawerOpen}
              onOpenChange={onItemDrawerOpenChange}
            >
        <${entityCapitalized}Page user={currentItem} />
     </CustomDrawer>
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
`;

  return code;
}
