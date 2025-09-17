"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/contexts/ContentContext";
import { useAmp } from "next/amp";
import { isAuthenticatedClient } from "@/lib/auth";

export const ShareContentDialog = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTemporary, setIsTemporary] = useState(true);
  const { toast } = useToast();
  const { addNewContent } = useContent();

  // useEffect(()=>{
  //   const isLoggedIn = isAuthenticatedClient()
  //   if(!isLoggedIn){
  //     setIsTemporary(true)
  //   }
  //   else{
  //     setIsTemporary(false)
  //   }

  // },[])

  // useEffect(()=>{
  //   const isLoggedIn = isAuthenticatedClient()
  //   if(!isLoggedIn){
  //     setIsTemporary(true)
  //   }
  //   else{
  //     setIsTemporary(false)
  //   }

  // },[])

  const setTemporaryCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isLoggedIn = isAuthenticatedClient()
    if(!isLoggedIn && isTemporary){
      toast({
        title: "Invalid Operation!",
        description: "You need to login to share permanent content",
        variant: "destructive",
      });
    }
  }
  

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post(
        isTemporary ? "/api/v1/createcontent?temp=true" : "/api/v1/createcontent",
        { content },
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate"
          },
        }
      );

      if (response.status === 201) {        
        // Show success toast
        toast({
          title: "Content Shared Successfully!",
          description: isTemporary 
            ? "Your temporary content has been shared and will expire in 24 hours." 
            : "Your content has been shared successfully.",
          variant: "default",
        });
        
        // Clear form and close dialog
        setContent("");
        setIsOpen(false);
        
        // Add to global context for real-time updates
        addNewContent(response.data.newPost);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      
      // Show error toast
      toast({
        title: "Error Sharing Content",
        description: "Something went wrong while sharing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [content, isTemporary, addNewContent, isSubmitting, toast]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setContent("");
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Share2 className="sm:mr-2 h-4 w-4" />
          <span className="sm:flex hidden">Share Something</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto border-0 shadow-2xl bg-gradient-to-br from-background to-muted/30">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Share Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground/80">Content</label>
            <Textarea
              rows={12}
              className="resize-none min-h-[300px] border-2 focus:border-primary/50 transition-colors duration-200 shadow-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your content here..."
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Input
                id="temp-checkbox-dialog"
                checked={isTemporary}
                onChange={(e)=>setTemporaryCheck(e)}
                type="checkbox"
                name="temp"
                className="w-4 h-4 accent-primary cursor-pointer"
                disabled={isSubmitting}
              />
              <label 
                className="text-sm font-medium text-foreground/80 cursor-pointer" 
                htmlFor="temp-checkbox-dialog"
              >
                Temporary (24 hours)
              </label>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="px-6 py-2 hover:bg-muted/50 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sharing..." : "Share Content"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ShareContentDialog.displayName = "ShareContentDialog";
