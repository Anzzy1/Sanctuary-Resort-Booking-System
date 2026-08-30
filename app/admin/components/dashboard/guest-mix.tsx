"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

const colors = ["#7c3aed", "#f97316", "#0ea5e9", "#e11d48"]

export function GuestMix({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1

  return (
    <div className="flex h-full flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:p-6 shadow-ambient">
      <h2 className="font-headline-md text-xl text-on-surface">Guest mix</h2>
      <p className="mt-1 text-sm text-on-surface-variant">By accommodation category</p>

      <div className="relative mx-auto mt-4 h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline-md text-2xl text-on-surface">{total}%</span>
          <span className="text-xs text-on-surface-variant">tracked</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {data.map((item, index) => (
          <li key={item.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-on-surface">
              <span className="size-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
              {item.name}
            </span>
            <span className="text-on-surface-variant">{item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}