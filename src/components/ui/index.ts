// UI Primitive Components
// Import all shared UI components from a single entry point:
// import { Button, Card, Input, Dialog, Badge, ... } from "@/components/ui"

export { Button } from "./Button";
export type { ButtonProps } from "./Button";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { Card } from "./Card";
export type { CardProps } from "./Card";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";

export { Dialog } from "./Dialog";
export type { DialogProps } from "./Dialog";

// Modal is kept as a backward-compat alias for Dialog
export { Modal } from "./Modal";

export { Dropdown } from "./Dropdown";
export type { DropdownProps, DropdownItem } from "./Dropdown";

export { Tooltip } from "./Tooltip";
export type { TooltipProps } from "./Tooltip";

export { Badge } from "./Badge";
export type { BadgeProps } from "./Badge";

export { Tabs, TabList, Tab, TabPanel } from "./Tabs";
export type { TabsProps, TabListProps, TabProps, TabPanelProps } from "./Tabs";

export { Loader } from "./Loader";
export type { LoaderProps } from "./Loader";

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
} from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export { ErrorState } from "./ErrorState";
export type { ErrorStateProps } from "./ErrorState";
