"use client"

export default function DashboardPage() {
  return (
    <div className="space-y-8">

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground">
        خوش آمدید 👋
      </h1>


      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            تعداد کاربران
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            1,248
          </h2>
        </div>


        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            سفارش‌های امروز
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            87
          </h2>
        </div>


        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            بازدید این ماه
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            72,344
          </h2>
        </div>

      </div>


      {/* Chart Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

        <p className="mb-4 font-medium text-foreground">
          نمودار فروش
        </p>

        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          نمودار اینجا قرار می‌گیرد
        </div>

      </div>

    </div>
  )
}
