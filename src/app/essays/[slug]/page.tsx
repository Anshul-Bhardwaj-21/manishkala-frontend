import { redirect } from "next/navigation";

interface EssaysSlugRedirectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EssaysSlugRedirectPage({ params }: EssaysSlugRedirectPageProps) {
  const { slug } = await params;
  redirect(`/blog/${slug}`);
}
