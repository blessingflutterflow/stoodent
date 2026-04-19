import { Suspense } from "react";
import SessionClient from "@/components/ui/SessionClient";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<></>}>
      <SessionClient id={id} />
    </Suspense>
  );
}
