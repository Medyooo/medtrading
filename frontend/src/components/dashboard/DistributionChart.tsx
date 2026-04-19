import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PnlDistribution } from "@/types"

interface Props {
    data: PnlDistribution[]
}

const COLORS = ["#10b981", "#ef4444"]

export function DistributionChart({ data }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Distribution BUY/SELL</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="direction"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ direction, count }) => `${direction}: ${count}`}
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number, name: string) => [value, name]}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}