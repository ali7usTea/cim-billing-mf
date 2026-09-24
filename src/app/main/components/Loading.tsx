import { cn, Spinner } from "cim-ui-components";

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("my-20 grid place-content-center", className)}>
      <Spinner />
    </div>
  );
}
