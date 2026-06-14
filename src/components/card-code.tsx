"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Check, Expand, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import hljs from "highlight.js"
import { useToast } from "@/hooks/use-toast"

interface CodeCardProps {
  id: string
  code: string
  createdAt?: string
  title?: string
  language?: string
  isProtected?: boolean
}

export function CodeCard({ id, code, createdAt, title, language, isProtected }: CodeCardProps) {
  const [copied, setCopied] = useState(false)
  const [modalCopied, setModalCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  
  const [isLocked, setIsLocked] = useState(isProtected)
  const [unlockedCode, setUnlockedCode] = useState(code)
  const [inputPassword, setInputPassword] = useState("")
  const [verifying, setVerifying] = useState(false)
  
  const [highlightedCode, setHighlightedCode] = useState("")
  const [detectedLanguage, setDetectedLanguage] = useState("")
  const { theme, resolvedTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    setIsLocked(isProtected)
    setUnlockedCode(code)
  }, [isProtected, code])

  useEffect(() => {
    const lightThemeUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
    const darkThemeUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/tokyo-night-dark.min.css"

    const linkId = "highlight-theme"
    let link = document.getElementById(linkId) as HTMLLinkElement | null

    if (!link) {
      link = document.createElement("link")
      link.id = linkId
      link.rel = "stylesheet"
      document.head.appendChild(link)
    }

    const currentTheme = theme === "system" ? resolvedTheme : theme
    link.href = currentTheme === "dark" ? darkThemeUrl : lightThemeUrl
  }, [theme, resolvedTheme])

  useEffect(() => {
    if (!unlockedCode) {
      setHighlightedCode("")
      setDetectedLanguage("plaintext")
      return
    }

    let result
    try {
      if (language) {
        result = hljs.highlight(unlockedCode, { language })
      } else {
        result = hljs.highlightAuto(unlockedCode)
      }
      setHighlightedCode(result.value)
      setDetectedLanguage(result.language ? result.language : "plaintext")
    } catch (err) {
      setHighlightedCode(unlockedCode)
      setDetectedLanguage("plaintext")
    }
  }, [unlockedCode, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(unlockedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const handleModalCopy = async () => {
    try {
      await navigator.clipboard.writeText(unlockedCode)
      setModalCopied(true)
      setTimeout(() => setModalCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/s/${id}`
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
      toast({
        title: "Link Copied!",
        description: "Direct share link copied to clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleUnlock = async () => {
    if (!inputPassword.trim() || verifying) return

    try {
      setVerifying(true)
      const response = await fetch("/api/v1/unlockcontent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: inputPassword }),
      })
      const data = await response.json()
      if (response.ok) {
        setUnlockedCode(data.content)
        setIsLocked(false)
        toast({
          title: "Unlocked",
          description: "Snippet unlocked successfully.",
        })
      } else {
        toast({
          title: "Access Denied",
          description: data.error || "Incorrect password.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to verify password.",
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Card className="border border-border flex flex-col justify-between min-h-[300px] bg-card text-card-foreground rounded-md">
      {/* Structured Card Header to prevent absolute overlaps */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
        <div className="flex items-center gap-1.5">
          {isProtected && (
            <span className="text-sm select-none" title={isLocked ? "Locked" : "Unlocked"}>
              {isLocked ? "🔒" : "🔓"}
            </span>
          )}
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
            {isLocked ? "Protected Share" : (title || "Snippet")}
          </span>
        </div>
        
        {/* Actions bar always in the header */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleCopyLink}
          >
            {linkCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </Button>

          {!isLocked && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-6xl h-auto max-h-[90vh] p-0 border border-border rounded-md">
                  <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between gap-4">
                    <DialogTitle className="text-sm font-bold font-mono">
                      {title || "Snippet Viewer"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="m-4 rounded border border-border bg-muted/20 relative overflow-hidden">
                    <div className="p-4 h-[70vh] overflow-auto">
                      <pre className="overflow-auto h-full font-mono text-sm">
                        <code
                          className={`hljs language-${detectedLanguage} text-sm leading-relaxed`}
                          dangerouslySetInnerHTML={{ __html: highlightedCode }}
                        />
                      </pre>
                      
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground gap-2 font-mono text-xs"
                          onClick={handleModalCopy}
                        >
                          {modalCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span>{modalCopied ? "Copied" : "Copy"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-center">
        {isLocked ? (
          <div className="space-y-4 py-8 px-2 w-full">
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-3xl">🔒</span>
              <span className="text-xs font-mono text-muted-foreground uppercase">Password Protected Share</span>
            </div>
            <div className="flex gap-2 max-w-sm mx-auto w-full">
              <input
                type="password"
                placeholder="Enter password..."
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="flex h-9 w-full rounded border border-input bg-transparent px-3 py-1 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={verifying}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock()
                }}
              />
              <Button 
                onClick={handleUnlock} 
                disabled={!inputPassword || verifying}
                className="font-mono text-xs"
                size="sm"
              >
                {verifying ? "Unlocking..." : "Unlock"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <pre className="overflow-auto min-h-60 max-h-60 rounded bg-muted/40 border border-border p-3 max-w-full font-mono text-sm">
              <code
                className={`hljs language-${detectedLanguage} text-sm leading-relaxed`}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
          </div>
        )}
      </div>

      {createdAt && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono bg-muted/5">
          <span>Expires in 24h</span>
          <span>{createdAt}</span>
        </div>
      )}
    </Card>
  )
}