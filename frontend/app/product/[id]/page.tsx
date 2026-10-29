import { Suspense } from "react";
import ProductDetail from "@/components/ProductDetail";
import MobileShell from "@/components/MobileShell";
import StatusBar from "@/components/StatusBar";

function ProductSkeleton() {
  return (
    <MobileShell>
      <StatusBar />
      <div className="flex flex-1 flex-col px-6 pb-4">
        <div className="mt-1 h-10 w-10 rounded-full bg-neutral-100" />
        <div className="mt-3 h-[230px] w-full animate-pulse rounded-3xl bg-neutral-100" />
        <div className="mt-5 flex items-center justify-between">
          <div className="h-7 w-24 animate-pulse rounded bg-neutral-100" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-100" />
        </div>
        <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-neutral-100" />
        <div className="mt-3 h-3 w-full animate-pulse rounded bg-neutral-100" />
        <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
      </div>
    </MobileShell>
  );
}

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
