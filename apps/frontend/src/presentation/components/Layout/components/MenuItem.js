import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";

export const MenuItem = ({ label, icon, href, items = [] }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <div className="flex flex-row items-center gap-2">
          <SidebarMenuButton asChild>
            <Link href={href}>
              {icon}
              <span className="line-clamp-1 text-ellipsis text-xs font-medium">
                {label}
              </span>
            </Link>
          </SidebarMenuButton>
          {items && items.length > 0 && open && (
            <CollapsibleTrigger className="ml-auto">
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={2} />
            </CollapsibleTrigger>
          )}
          {items && items.length > 0 && !open && (
            <CollapsibleTrigger className="ml-auto">
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                strokeWidth={2}
              />
            </CollapsibleTrigger>
          )}
        </div>
        {items && items.length > 0 && open && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {items.slice(0, 3).map((subitem) => (
                <SidebarMenuSubButton key={subitem.id} asChild>
                  <Link href={`${href}/${subitem.id}`}>
                    {subitem.icon}
                    <span className="line-clamp-1 text-ellipsis text-xs font-medium">
                      {subitem.title}
                    </span>
                  </Link>
                </SidebarMenuSubButton>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};
