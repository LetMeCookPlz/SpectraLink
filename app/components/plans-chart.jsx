"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

const chartConfig = {
  count: {
    label: "Total Connections",
    color: "hsl(var(--chart-1))",
  },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-4 rounded-md shadow-md border border-border text-sm"
        style={{ backgroundColor: "hsl(222.2, 84%, 4.9%)", color: "white" }}
      >
        <p className="font-bold">{`${label}`}</p>
        <p>{`Всього підключень: ${payload[0].value}`}</p>
        {Object.entries(payload[0].payload)
          .filter(([key]) => key !== 'name' && key !== 'count')
          .map(([key, value]) => (
            <p key={key}>{`${key}: ${value}`}</p>
          ))}
      </div>
    )
  }

  return null
}

export function PlansChart({ connections, plans }) {
  const processData = () => {
    const planUsage = plans.map(plan => {
      const connectionsForPlan = connections.filter(conn => conn.plan_id === plan.plan_id)
      const connectionTypes = connectionsForPlan.reduce((acc, conn) => {
        acc[conn.connection_type] = (acc[conn.connection_type] || 0) + 1
        return acc
      }, {})

      return {
        name: plan.name,
        count: connectionsForPlan.length,
        ...connectionTypes
      }
    })

    return planUsage
  }

  const chartData = processData()

  return (
    <Card className="mt-20 bg-transparent border-none shadow-none">
      <CardHeader className="flex justify-center items-center">
        <CardTitle className="text-lg">Статистика використання тарифних планів</CardTitle>
        <CardDescription className="text-base">Кількість підключень до кожного плану</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <ChartContainer
          config={chartConfig}
          className="w-3/4 h-[300px] sm:w-1/2" // Restrict width for smaller screen usage
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis className="text-base" dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="var(--color-count)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
