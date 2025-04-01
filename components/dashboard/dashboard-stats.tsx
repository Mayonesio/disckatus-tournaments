"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveBar } from "@nivo/bar"
import { ResponsivePie } from "@nivo/pie"
import { ResponsiveLine } from "@nivo/line"

export function DashboardStats() {
  // Datos de ejemplo para las gráficas
  const attendanceData = [
    { month: "Ene", asistencia: 25 },
    { month: "Feb", asistencia: 30 },
    { month: "Mar", asistencia: 28 },
    { month: "Abr", asistencia: 32 },
    { month: "May", asistencia: 35 },
    { month: "Jun", asistencia: 30 },
    { month: "Jul", asistencia: 28 },
    { month: "Ago", asistencia: 20 },
    { month: "Sep", asistencia: 32 },
    { month: "Oct", asistencia: 38 },
    { month: "Nov", asistencia: 40 },
    { month: "Dic", asistencia: 35 },
  ]

  const genderData = [
    { id: "Hombres", label: "Hombres", value: 60, color: "hsl(240, 33%, 18%)" },
    { id: "Mujeres", label: "Mujeres", value: 40, color: "hsl(45, 86%, 60%)" },
  ]

  const tournamentTypeData = [
    { tournament: "Fun", participantes: 45 },
    { tournament: "Control", participantes: 35 },
    { tournament: "CE", participantes: 30 },
  ]

  const performanceData = [
    {
      id: "Victorias",
      data: [
        { x: "Ene", y: 2 },
        { x: "Feb", y: 3 },
        { x: "Mar", y: 1 },
        { x: "Abr", y: 4 },
        { x: "May", y: 3 },
        { x: "Jun", y: 2 },
      ],
    },
    {
      id: "Derrotas",
      data: [
        { x: "Ene", y: 1 },
        { x: "Feb", y: 2 },
        { x: "Mar", y: 3 },
        { x: "Abr", y: 1 },
        { x: "May", y: 2 },
        { x: "Jun", y: 3 },
      ],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Asistencia Mensual</CardTitle>
          <CardDescription>Número de jugadores que asistieron a torneos por mes</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveBar
            data={attendanceData}
            keys={["asistencia"]}
            indexBy="month"
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            padding={0.3}
            colors={["hsl(45, 86%, 60%)"]}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            animate={true}
          />
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Distribución por Género</CardTitle>
          <CardDescription>Porcentaje de jugadores por género</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsivePie
            data={genderData}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ datum: "data.color" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            radialLabelsSkipAngle={10}
            radialLabelsTextXOffset={6}
            radialLabelsTextColor="#333333"
            radialLabelsLinkOffset={0}
            radialLabelsLinkDiagonalLength={16}
            radialLabelsLinkHorizontalLength={24}
            radialLabelsLinkStrokeWidth={1}
            radialLabelsLinkColor={{ from: "color" }}
            slicesLabelsSkipAngle={10}
            slicesLabelsTextColor="#333333"
            animate={true}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                translateY: 56,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                symbolSize: 18,
                symbolShape: "circle",
              },
            ]}
          />
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Participación por Tipo de Torneo</CardTitle>
          <CardDescription>Número de jugadores por tipo de torneo</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveBar
            data={tournamentTypeData}
            keys={["participantes"]}
            indexBy="tournament"
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            padding={0.3}
            colors={["hsl(240, 33%, 18%)"]}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            animate={true}
          />
        </CardContent>
      </Card>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Rendimiento del Equipo</CardTitle>
          <CardDescription>Victorias y derrotas en los últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveLine
            data={performanceData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: 0,
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

