export const siteConfig = {
  name: "QuikShare",
  url: "https://share.taskynow.com",
  ogImage: "https://ui.shadcn.com/og.jpg",
  description:
    "A set of beautifully designed components that you can customize, extend, and build on.",
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/NIKHIL95969/QuickShare",
  },
  navItems: [
    {
      href: "/",
      label: "Home",
      icon: "home",  // 👈 string, not component
    },
    {
      href: "/code",
      label: "Code",
      icon: "code",
    },
    {
      href: "#",
      label: "Upload",
      icon: "upload",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: "profile",
    },
  ],
}
