"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CodeCard } from "@/components/card-code";
import PaginationControls from "@/components/pagination-controls";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export default function IndexPage() {
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [isProtectedShare, setIsProtectedShare] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `/api/v1/getcontent?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url, {
        method: "POST",
        cache: "no-store",
      });
      const data = await response.json();
      if (data && data.data) {
        setSharedItems(data.data);
        setTotalItems(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleShare = async () => {
    if (!content.trim() || isSubmitting) return;
    if (isProtectedShare && !password.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        content,
        password: isProtectedShare ? password : undefined
      };

      const response = await axios.post(
        "/api/v1/createcontent",
        payload,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );

      if (response.status === 201) {
        toast({
          title: "Shared Successfully!",
          description: isProtectedShare 
            ? "Password protected temporary snippet shared." 
            : "Temporary snippet shared for 24 hours.",
        });
        setContent("");
        setPassword("");
        setIsProtectedShare(false);
        setPage(1);
        fetchItems();
      }
    } catch (error) {
      console.error("Error sharing content:", error);
      toast({
        title: "Error Sharing Content",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl flex-1 flex flex-col">
      {/* Brand Hero */}
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono uppercase">
          Temporary Share
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          Paste text or code below. It will expire and automatically delete after 24 hours.
        </p>
      </div>

      {/* Share Box */}
      <div className="border border-border p-6 rounded-md bg-card mb-10">
        <div className="space-y-4">
          <Textarea
            rows={8}
            className="font-mono text-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border border-border"
            placeholder="Paste or type content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                id="protect-checkbox"
                type="checkbox"
                checked={isProtectedShare}
                onChange={(e) => {
                  setIsProtectedShare(e.target.checked);
                  if (!e.target.checked) setPassword("");
                }}
                className="w-4 h-4 accent-primary cursor-pointer border border-border rounded"
              />
              <label
                htmlFor="protect-checkbox"
                className="text-xs font-mono text-muted-foreground uppercase cursor-pointer select-none"
              >
                Password Protected
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full sm:max-w-xs">
                {isProtectedShare && (
                  <Input
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono text-sm border border-border"
                    disabled={isSubmitting}
                  />
                )}
              </div>
              <Button
                onClick={handleShare}
                disabled={!content.trim() || (isProtectedShare && !password.trim()) || isSubmitting}
                className="px-6 rounded-md font-mono w-full sm:w-auto ml-auto"
              >
                {isSubmitting ? "Sharing..." : "Share Snippet"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Feed */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold font-mono uppercase text-foreground">
              Active Shares
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              ℹ️ Password protected shares are not searchable.
            </p>
          </div>
          <div className="w-full sm:max-w-xs">
            <Input
              type="text"
              placeholder="Search active shares..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="font-mono text-sm border border-border"
            />
          </div>
        </div>

        {/* Content Display */}
        {isLoading ? (
          <div className="text-center py-12 border border-border rounded-md font-mono text-sm text-muted-foreground">
            Loading active shares...
          </div>
        ) : sharedItems.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-md">
            <p className="text-muted-foreground font-mono text-sm">No active shares found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sharedItems.map((item) => (
              <CodeCard
                key={item._id}
                id={item._id}
                code={item.content}
                isProtected={item.isProtected}
                createdAt={new Date(item.createdAt).toLocaleString()}
                title="Active Snippet"
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalItems > limit && (
          <div className="pt-6">
            <PaginationControls
              page={page}
              total={totalItems}
              limit={limit}
              setPage={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
