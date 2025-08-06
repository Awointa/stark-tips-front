import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"

interface TipPage {
    id: string;
    name: string;
    description: string;
    totalAmount: string;
    tipCount: number;
    createdAt: string;
    isActive: boolean;
    goal?: string;
}

interface ContractStats {
    totalPages: bigint | undefined;
    totalTips: number;
    totalAmount: number;
    activePagesCount: number;
    averageTip: number;
}

const Analytics = ({tipPages, contractStats}: {tipPages: TipPage[], contractStats: ContractStats}) => {
    return (
        <TabsContent value="analytics" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+0.8 STRK</div>
              <p className="text-xs text-muted-foreground">↗️ +23% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Supporters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <p className="text-xs text-muted-foreground">↗️ +4 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Best Performing Page</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">My Creative Journey</div>
              <p className="text-xs text-muted-foreground">2.45 STRK total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Peak Tip Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">Yesterday</div>
              <p className="text-xs text-muted-foreground">0.3 STRK in tips</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tips Over Time</CardTitle>
              <CardDescription>Your tip earnings trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would go here</p>
                  <p className="text-sm">Showing earnings over the last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Supporters</CardTitle>
              <CardDescription>Your most generous supporters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">0x1234...5678</p>
                    <p className="text-sm text-gray-500">3 tips</p>
                  </div>
                  <Badge variant="secondary">0.3 STRK</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">0x9876...4321</p>
                    <p className="text-sm text-gray-500">2 tips</p>
                  </div>
                  <Badge variant="secondary">0.25 STRK</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">0x5555...7777</p>
                    <p className="text-sm text-gray-500">1 tip</p>
                  </div>
                  <Badge variant="secondary">0.2 STRK</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Page Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Page Performance</CardTitle>
            <CardDescription>How each of your tip pages is performing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tipPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{page.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{page.tipCount} tips</span>
                      <span>{page.totalAmount} STRK</span>
                      <span>
                        Avg:{" "}
                        {page.tipCount > 0
                          ? (Number.parseFloat(page.totalAmount) / page.tipCount).toFixed(3)
                          : "0.000"}{" "}
                        STRK
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{page.totalAmount} STRK</div>
                    <Badge variant={page.isActive ? "default" : "secondary"}>
                      {page.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    );
};

export default Analytics;