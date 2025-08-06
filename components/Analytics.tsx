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

      {/* Analytics Cards with real data */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{contractStats.totalPages?.toString() || "0"}</div>
            <p className="text-xs text-muted-foreground">Pages created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tips Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{contractStats.totalTips}</div>
            <p className="text-xs text-muted-foreground">Across all pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Performing Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {tipPages.length > 0 
                ? tipPages.reduce((prev, current) => 
                    (Number(prev.totalAmount) > Number(current.totalAmount)) ? prev : current
                  ).name
                : "No pages yet"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {tipPages.length > 0 
                ? `${tipPages.reduce((prev, current) => 
                    (Number(prev.totalAmount) > Number(current.totalAmount)) ? prev : current
                  ).totalAmount} ETH`
                : "0 ETH"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average per Page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {tipPages.length > 0 ? (contractStats.totalAmount / tipPages.length).toFixed(6) : "0.000000"} ETH
            </div>
            <p className="text-xs text-muted-foreground">Per page average</p>
          </CardContent>
        </Card>
      </div>

      {/* Page Performance with real data */}
      <Card>
        <CardHeader>
          <CardTitle>Page Performance</CardTitle>
          <CardDescription>How each of your tip pages is performing</CardDescription>
        </CardHeader>
        <CardContent>
          {tipPages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pages to analyze yet</p>
          ) : (
            <div className="space-y-4">
              {tipPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{page.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{page.tipCount} tips</span>
                      <span>{page.totalAmount} ETH</span>
                      <span>
                        Avg:{" "}
                        {page.tipCount > 0
                          ? (Number.parseFloat(page.totalAmount) / page.tipCount).toFixed(6)
                          : "0.000000"}{" "}
                        ETH
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{page.totalAmount} ETH</div>
                    <Badge variant={page.isActive ? "default" : "secondary"}>
                      {page.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
    );
};

export default Analytics;