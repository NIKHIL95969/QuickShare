import { connect } from "@/dbConfig/dbConfig";
import ContentPost from "@/models/contentModel";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CodeCard } from "@/components/card-code";

export const dynamic = "force-dynamic";

interface SharedSnippetPageProps {
  params: {
    id: string;
  };
}

export default async function SharedSnippetPage({ params }: SharedSnippetPageProps) {
  const { id } = params;

  try {
    await connect();
    const item = await ContentPost.findOne({
      _id: id,
      temp: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (!item) {
      notFound();
    }

    const isProtected = !!item.password;

    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl flex-1 flex flex-col justify-center">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="gap-2 font-mono text-xs">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        <div className="w-full">
          <CodeCard
            id={item._id.toString()}
            code={isProtected ? "" : item.content}
            isProtected={isProtected}
            createdAt={new Date(item.createdAt).toLocaleDateString()}
            title="Shared Snippet"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error retrieving shared snippet:", error);
    notFound();
  }
}
