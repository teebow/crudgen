import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import UserPage from "../user/UserPage";
import type { UserDto } from "@dto/user/dto/user.dto";
import type { PropsWithChildren } from "react";

type DrawerProps = {
    isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
} & PropsWithChildren;

export default function CustomDrawer({ isOpen, onOpenChange, children }: DrawerProps) {
  return (
    <>
      {/* <Button
        color="primary"
        endContent={
          <svg
            height="16"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.75 1.25a.75.75 0 1 0-1.5 0v.823l-.392.044c-.9.121-1.658.38-2.26.982s-.861 1.36-.982 2.26C.5 6.225.5 7.328.5 8.695v.11l.117 3.337c.121.9.38 1.658.982 2.26s1.36.861 2.26.982c.867.117 1.969.117 3.337.117h1.658l3.337-.117c.9-.121 1.658-.38 2.26-.982s.861-1.36.982-2.26c.117-.867.117-1.969.117-3.337v-.11l-.117-3.337c-.121-.9-.38-1.658-.982-2.26s-1.36-.861-2.26-.982l-.44-.048V1.25a.75.75 0 0 0-1.5 0v.756L8.853 2H7.195q-.78-.002-1.445.006zm4.5 3v-.744L8.798 3.5H7.25l-1.5.007v.743a.75.75 0 1 1-1.5 0v-.67l-.192.023c-.734.099-1.122.279-1.399.556s-.457.665-.556 1.399C2.002 6.313 2 7.315 2 8.75l.103 3.192c.099.734.279 1.122.556 1.399s.665.457 1.399.556c.755.101 1.756.103 3.192.103h1.548l3.192-.103c.734-.099 1.122-.279 1.399-.556s.457-.665.556-1.399c.102-.755.103-1.757.103-3.192l-.103-3.192c-.099-.734-.279-1.122-.556-1.399s-.665-.457-1.399-.556l-.241-.028v.675a.75.75 0 0 1-1.5 0zm-5 3.5a.75.75 0 1 1-1.5 0 .75.75 0 1 1 1.5 0m0 3.5a.75.75 0 1 1-1.5 0 .75.75 0 1 1 1.5 0M8 8.5A.75.75 0 1 0 8 7a.75.75 0 1 0 0 1.5m.75 2.75a.75.75 0 1 1-1.5 0 .75.75 0 1 1 1.5 0M11.5 8.5a.75.75 0 1 0 0-1.5.75.75 0 1 0 0 1.5m.75 2.75a.75.75 0 1 1-1.5 0 .75.75 0 1 1 1.5 0"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        }
        variant="flat"
        onPress={onOpen}
      >
        See Event
      </Button> */}
      <Drawer
        hideCloseButton
        backdrop="blur"
        classNames={{
          base: "data-[placement=right]:sm:m-2 data-[placement=left]:sm:m-2  rounded-medium",
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="absolute top-0 inset-x-0 z-50 flex flex-row gap-2 px-2 py-2 border-b border-default-200/50 justify-between bg-content1/50 backdrop-saturate-150 backdrop-blur-lg">
                <Tooltip content="Close">
                  <Button
                    isIconOnly
                    className="text-default-400"
                    size="sm"
                    variant="light"
                    onPress={onClose}
                  >
                    <Icon icon="lucide:x" />
                  </Button>
                </Tooltip>
                <div className="w-full flex justify-start gap-10">Toto</div>
                <div className="flex gap-1 items-center">
                  <Tooltip content="Previous">
                    <Button
                      isIconOnly
                      className="text-default-500"
                      size="sm"
                      variant="flat"
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Next">
                    <Button
                      isIconOnly
                      className="text-default-500"
                      size="sm"
                      variant="flat"
                    >
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </Button>
                  </Tooltip>
                </div>
              </DrawerHeader>
              <DrawerBody className="pt-16">
                {children}
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
