"use client"

// import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Zap, Shield, Clock, Users, Code, FileText, Share2, Plus, BarChart3, TrendingUp } from "lucide-react"
import { useEffect, useState, useCallback } from "react"

import { Announcement } from "@/components/announcement"
// import { CardsDemo } from "@/components/cards"
// import { ExamplesNav } from "@/components/examples-nav"
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import { PageNav } from "@/components/page-nav"
// import { ThemeSelector } from "@/components/theme-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { isAuthenticatedClient } from "@/lib/auth"
import { useContent } from "@/contexts/ContentContext"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

const title = "QuikShare"
const description =
  "🚀 Instantly share text, code snippets, and files between your devices. No more emailing yourself links."

// Remove static generation since we now have client-side auth logic
// export const dynamic = "force-static"
// export const revalidate = false

// export const metadata: Metadata = {
//   title,
//   description,
//   openGraph: {
//     images: [
//       {
//         url: `/og?title=${encodeURIComponent(
//           title
//         )}&description=${encodeURIComponent(description)}`,
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     images: [
//       {
//         url: `/og?title=${encodeURIComponent(
//           title
//         )}&description=${encodeURIComponent(description)}`,
//       },
//     ],
//   },
// }

// Dashboard component for authenticated users
function DashboardView() {
  const { 
    permanentContent, 
    temporaryContent, 
    permanentTotal, 
    temporaryTotal,
    setPermanentContent,
    setPermanentTotal,
    setTemporaryContent,
    setTemporaryTotal
  } = useContent();
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch both permanent and temporary content for dashboard stats
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch permanent content
      const permanentResponse = await fetch('/api/v1/getcontent?temp=false&page=1&limit=6', {
        cache: 'no-store',
        method: 'POST'
      });
      const permanentData = await permanentResponse.json();
      
      // Fetch temporary content
      const temporaryResponse = await fetch('/api/v1/getcontent?temp=true&page=1&limit=6', {
        cache: 'no-store',
        method: 'POST'
      });
      const temporaryData = await temporaryResponse.json();
      
      if (permanentData && permanentData.data) {
        setPermanentContent(permanentData.data);
        setPermanentTotal(permanentData.total || 0);
      }
      
      if (temporaryData && temporaryData.data) {
        setTemporaryContent(temporaryData.data);
        setTemporaryTotal(temporaryData.total || 0);
      }
      
    } catch (error) {
      console.error("Error fetching dashboard content:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setPermanentContent, setPermanentTotal, setTemporaryContent, setTemporaryTotal]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handlePremium = ()=>{
    toast({
      title: "You are not premium user.",
      description: "You discovered a premium feature",
      variant: "default",
    })  }

  // Show loading state while fetching content
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader>
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <Announcement />
          </div>
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
            <PageHeaderHeading className="max-w-4xl">
              <span 
                className="inline-block text-transparent bg-clip-text animate-gradient-flow"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--primary)), #3b82f6, #8b5cf6, #06b6d4, hsl(var(--primary)))',
                  backgroundSize: '200% 100%',
                  animation: 'gradient-flow 3s ease-in-out infinite',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Welcome back!
              </span>
            </PageHeaderHeading>
          </div>
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
            <PageHeaderDescription className="animate-pulse">
              <Skeleton className="h-6 w-64 mx-auto" />
            </PageHeaderDescription>
          </div>
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-10 w-32 mx-auto sm:mx-0" />
              <Skeleton className="h-10 w-32 mx-auto sm:mx-0" />
            </div>
          </div>
        </PageHeader>

        {/* Stats Section Skeleton */}
        <div className="container-wrapper section-soft py-8">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="container-wrapper section-soft py-8">
          <div className="container">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-32 mx-auto mb-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const stats = [
    {
      title: "Total Content",
      value: permanentTotal + temporaryTotal,
      icon: FileText,
      description: "All your shared content"
    },
    {
      title: "Permanent",
      value: permanentTotal,
      icon: Code,
      description: "Permanent content items"
    },
    {
      title: "Temporary",
      value: temporaryTotal,
      icon: Clock,
      description: "24-hour temporary content"
    }
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Announcement />
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <PageHeaderHeading className="max-w-4xl">
            <span 
              className="inline-block text-transparent bg-clip-text animate-gradient-flow"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), #3b82f6, #8b5cf6, #06b6d4, hsl(var(--primary)))',
                backgroundSize: '200% 100%',
                animation: 'gradient-flow 3s ease-in-out infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome back!
            </span>
          </PageHeaderHeading>
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
          <PageHeaderDescription className="animate-pulse">
            Manage and share your content effortlessly
          </PageHeaderDescription>
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
          <PageActions>
            <Button asChild size="lg" className="hover:scale-105 transition-all duration-200 group w-full sm:w-auto">
              <Link href="/code">
                <Code className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View All Content</span>
                <span className="sm:hidden">All Content</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="hover:scale-105 transition-all duration-200 w-full sm:w-auto">
              <Link href="/temp">
                <Clock className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View Temporary</span>
                <span className="sm:hidden">Temporary</span>
              </Link>
            </Button>
          </PageActions>
        </div>
      </PageHeader>

      {/* Stats Section */}
      <div className="container-wrapper section-soft py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={stat.title}
                className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 hover:shadow-lg transition-all hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container-wrapper section-soft py-8">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              <span 
                className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Quick Actions
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex flex-col gap-2 hover:scale-105 transition-all">
              <Link href="/code">
                <Code className="h-6 w-6" />
                <span>All Content</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex flex-col gap-2 hover:scale-105 transition-all">
              <Link href="/temp">
                <Clock className="h-6 w-6" />
                <span>Temporary</span>
              </Link>
            </Button>
            <Button onClick={handlePremium} asChild variant="outline" className="h-20 flex flex-col gap-2 hover:scale-105 transition-all">
              <div>
                <Plus className="h-6 w-6" />
                <span>Share File</span>
              </div>
            </Button>
            <Button  onClick={handlePremium} asChild variant="outline" className="h-20 flex flex-col gap-2 hover:scale-105 transition-all">
              <div>
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Landing page component for non-authenticated users
function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Share content instantly across all your devices with zero setup required."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your content is encrypted and secure. Only you control who sees what."
    },
    {
      icon: Clock,
      title: "Temporary Sharing",
      description: "Set content to expire automatically for sensitive or time-sensitive information."
    },
    {
      icon: Code,
      title: "Code Snippets",
      description: "Perfect for developers to share code snippets with syntax highlighting."
    },
    {
      icon: FileText,
      title: "Text & Files",
      description: "Share any text content or files quickly and efficiently."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team on shared content."
    }
  ]

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Announcement />
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
          <PageHeaderHeading className="max-w-4xl">
            <span 
              className="inline-block text-transparent bg-clip-text animate-gradient-flow"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), #3b82f6, #8b5cf6, #06b6d4, hsl(var(--primary)))',
                backgroundSize: '200% 100%',
                animation: 'gradient-flow 3s ease-in-out infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              QuikShare
            </span>
          </PageHeaderHeading>
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
          <PageHeaderDescription className="animate-pulse">
            {description}
          </PageHeaderDescription>
        </div>
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
          <PageActions>
            <Button asChild size="lg" className="hover:scale-105 transition-all duration-200 group w-full sm:w-auto">
              <Link href="/register">
                <span className="hidden sm:inline">Sign up Now</span>
                <span className="sm:hidden">Sign Up</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="hover:scale-105 transition-all duration-200 w-full sm:w-auto">
              <Link href="/code">
                <span className="hidden sm:inline">Explore Features</span>
                <span className="sm:hidden">Explore</span>
              </Link>
            </Button>
          </PageActions>
        </div>
      </PageHeader>

      <PageNav className="hidden md:flex">
        {/* <ExamplesNav className="[&>a:first-child]:text-primary flex-1 overflow-hidden" /> */}
        {/* <ThemeSelector className="mr-4 hidden md:flex" /> */}
      </PageNav>

      {/* Features Section */}
      <div className="container-wrapper section-soft py-16">
        <div className="container">
          <div className="text-center mb-12">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                <span 
                  className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Why Choose QuikShare?
                </span>
              </h2>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful features designed to make content sharing effortless and secure.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 hover:shadow-lg transition-all hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="container-wrapper section-soft py-16">
        <div className="container">
          <div className="text-center mb-12">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                <span 
                  className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  See It In Action
                </span>
              </h2>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Experience the power of QuikShare with our intuitive dashboard.
              </p>
            </div>
          </div>
          
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-300 border-border/50 rounded-lg border overflow-hidden shadow-2xl">
            <Image
              src="/home-img-light.png"
              width={1400}
              height={875}
              alt="QuikShare Dashboard Preview"
              className="block dark:hidden transition-transform duration-300 hover:scale-105"
              priority
            />
            <Image
              src="/home-img-dark.png"
              width={1400}
              height={875}
              alt="QuikShare Dashboard Preview"
              className="hidden dark:block transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container-wrapper section-soft py-16 bg-muted/30 mb-20">
        <div className="container">
          <div className="text-center">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                <span 
                  className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent"
                  style={{
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Ready to Get Started?
                </span>
              </h2>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already sharing content faster and more securely.
              </p>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-400">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="hover:scale-105 transition-all duration-200 group w-full sm:w-auto">
                  <Link href="/register">
                    <Share2 className="mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">Start Sharing Now</span>
                    <span className="sm:hidden">Start Sharing</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                  <Link href="/temp">
                    <span className="hidden sm:inline">View Examples</span>
                    <span className="sm:hidden">Examples</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with authentication logic
export default function IndexPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      try {
        const authStatus = isAuthenticatedClient();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  // if (isLoading) {
  //   return (
  //     <div className="flex flex-1 flex-col">
  //       <PageHeader>
  //         <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
  //           <Announcement />
  //         </div>
  //         <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
  //           <PageHeaderHeading className="max-w-4xl">
  //             <Skeleton className="h-10 w-64 mx-auto" />
  //           </PageHeaderHeading>
  //         </div>
  //         <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
  //           <PageHeaderDescription>
  //             <Skeleton className="h-6 w-80 mx-auto" />
  //           </PageHeaderDescription>
  //         </div>
  //         <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
  //           <div className="flex flex-col sm:flex-row gap-4 justify-center">
  //             <Skeleton className="h-10 w-32" />
  //             <Skeleton className="h-10 w-32" />
  //           </div>
  //         </div>
  //       </PageHeader>

  //       <div className="container-wrapper section-soft py-8">
  //         <div className="container">
  //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //             {[1,2,3].map(i => (
  //               <Card key={i}>
  //                 <CardHeader>
  //                   <Skeleton className="h-4 w-24" />
  //                 </CardHeader>
  //                 <CardContent>
  //                   <Skeleton className="h-24 w-full" />
  //                 </CardContent>
  //               </Card>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Show dashboard for authenticated users, landing page for others
  return isAuthenticated ? <DashboardView /> : <LandingPage />;
}
