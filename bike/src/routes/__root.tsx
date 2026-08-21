import '@/styles.css'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Navbar, MobileNav } from '@/components/navbar'
import { BikeDetailModal } from '@/components/bike-detail-modal'
import { HandoverChecklist } from '@/components/handover-checklist'
import { AuthDialog } from '@/components/auth'
import { hydrateOnMount } from '@/store/store'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ridegoa — Rent bikes across Goa' },
      {
        name: 'description',
        content: 'Two-wheeler rentals across Anjuna, Baga, Panjim, Vagator, Candolim and Palolem. Book directly from verified hosts.',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  hydrateOnMount()

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen font-sans">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <MobileNav />
        <BikeDetailModal />
        <HandoverChecklist />
        <AuthDialog />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#141a28',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#edf1f7',
              borderRadius: '14px',
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}
