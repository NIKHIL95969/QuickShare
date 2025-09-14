// import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Zap, Shield, Clock, Users, Code, FileText, Share2 } from "lucide-react"

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

const title = "QuikShare"
const description =
  "🚀 Instantly share text, code snippets, and files between your devices. No more emailing yourself links."

export const dynamic = "force-static"
export const revalidate = false

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

export default function IndexPage() {
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
            <Button asChild size="lg" className="hover:scale-105 transition-all duration-200 group">
              <Link href="/code">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="hover:scale-105 transition-all duration-200">
              <Link href="/code">Explore Features</Link>
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
              src="/home-img.png"
              width={1400}
              height={875}
              alt="QuikShare Dashboard Preview"
              className="block dark:hidden transition-transform duration-300 hover:scale-105"
              priority
            />
            <Image
              src="/home-img.png"
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
                <Button asChild size="lg" className="hover:scale-105 transition-all duration-200 group">
                  <Link href="/register">
                    <Share2 className="mr-2 h-5 w-5" />
                      Start Sharing Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="hover:scale-105 transition-all duration-200">
                  <Link href="/code">View Examples</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
