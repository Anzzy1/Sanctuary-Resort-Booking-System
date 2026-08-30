"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

export function OccupancyChart({
  data,
}: {
  data: { month: string; occupancy: number; revenue: number; bookings: number }[]
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-headline-md text-xl text-on-surface">Occupancy & revenue</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Performance by booking month</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-violet-500" />
            Occupancy %
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-orange-500" />
            Revenue (₱)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-sky-500" />
            Bookings
          </span>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bkg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#c2c7ca" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#42484a", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              width={45}
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#7c3aed", fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              yAxisId="rev"
              orientation="right"
              width={60}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#f97316", fontSize: 12 }}
              tickFormatter={(v: number) => (v >= 1000 ? `₱${Math.round(v / 1000)}k` : `₱${v}`)}
            />
            <YAxis
              yAxisId="cnt"
              orientation="right"
              width={38}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#0ea5e9", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: "#c2c7ca" }}
              formatter={(value, name) => {
                if (name === "Occupancy %") return `${value}%`
                if (name === "Revenue ₱") return `₱${Number(value).toLocaleString("en-US")}`
                return value
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #c2c7ca",
                background: "#ffffff",
                color: "#1b1c1a",
                fontSize: 13,
              }}
            />
            <Area yAxisId="left" type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#7c3aed" strokeWidth={2.5} fill="url(#occ)" />
            <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue ₱" stroke="#f97316" strokeWidth={2.5} fill="url(#rev)" />
            <Area yAxisId="cnt" type="monotone" dataKey="bookings" name="Bookings" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#bkg)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}