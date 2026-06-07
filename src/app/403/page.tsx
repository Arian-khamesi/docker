import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center border border-border bg-card rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-3">403</h1>
        <p className="text-muted-foreground mb-6">
          شما دسترسی لازم برای مشاهده این صفحه را ندارید.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition"
        >
          بازگشت به داشبورد
        </Link>
      </div>
    </div>
  )
}
