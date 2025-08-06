import { useState, useEffect, useMemo, useCallback } from "react"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, RefreshCw, TrendingUp, Users, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContract, useReadContract } from "@starknet-react/core"
import { Contract } from "starknet"

// Import your ABI
import { MY_CONTRACT_ABI } from "@/constants/abi/MyContract" 

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

interface Tip {
    id: bigint;
    page_id: bigint;
    sender: string;
    creator: string;
    amount: bigint;
    message: string;
    timestamp: bigint;
}

interface ContractTipPage {
    id: bigint;
    creator: string;
    name: string;
    description: string;
    created_at: bigint;
    total_tips_recieved: bigint;
    total_amount_recieved: bigint;
    is_active: boolean;
}

const Analytics = ({ 
    contractAddress, 
    creatorAddress 
}: { 
    contractAddress: string;
    creatorAddress: string | undefined;
}) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tipPages, setTipPages] = useState<TipPage[]>([]);
    const [contractStats, setContractStats] = useState<ContractStats>({
        totalPages: BigInt(0),
        totalTips: 0,
        totalAmount: 0,
        activePagesCount: 0,
        averageTip: 0
    });

    // Initialize contract
    const { contract } = useContract({
        abi: MY_CONTRACT_ABI,
        address: contractAddress as `0x${string}`,
    });

    // Read total pages from contract
    const { data: totalPagesData, refetch: refetchTotalPages } = useReadContract({
        functionName: "get_total_pages",
        args: [],
        abi: MY_CONTRACT_ABI,
        address: contractAddress as `0x${string}`,
    });

    // Read creator pages
    const { data: creatorPagesData, refetch: refetchCreatorPages } = useReadContract({
        functionName: "get_creator_pages",
        args: [creatorAddress as `0x${string}`],
        abi: MY_CONTRACT_ABI,
        address: contractAddress as `0x${string}`,
    });

    // Utility function to convert Wei to readable format (assuming 18 decimals for STRK)
    const formatAmount = (amount: bigint): string => {
        const divisor = BigInt(10 ** 18);
        const whole = amount / divisor;
        const fractional = amount % divisor;
        const fractionalStr = fractional.toString().padStart(18, '0').slice(0, 6);
        return `${whole}.${fractionalStr}`;
    };

    // Fetch detailed page information
    const fetchPageDetails = useCallback(async (pageIds: bigint[]): Promise<TipPage[]> => {
        if (!contract || !pageIds.length) return [];

        const pages: TipPage[] = [];
        
        for (const pageId of pageIds) {
            try {
                // Get page info
                const pageInfo = await contract.call("get_page_info", [pageId]) as ContractTipPage;
                
                // Get tips for this page to calculate tip count and amounts
                const tips = await contract.call("get_tips_for_page", [pageId]) as Tip[];
                
                pages.push({
                    id: pageInfo.id.toString(),
                    name: pageInfo.name,
                    description: pageInfo.description,
                    totalAmount: formatAmount(pageInfo.total_amount_recieved),
                    tipCount: Number(pageInfo.total_tips_recieved),
                    createdAt: new Date(Number(pageInfo.created_at) * 1000).toLocaleDateString(),
                    isActive: pageInfo.is_active
                });
            } catch (error) {
                console.error(`Error fetching page ${pageId}:`, error);
            }
        }

        return pages;
    }, [contract]);

    // Calculate contract stats
    const calculateStats = useCallback((pages: TipPage[]): ContractStats => {
        const totalTips = pages.reduce((sum, page) => sum + page.tipCount, 0);
        const totalAmount = pages.reduce((sum, page) => sum + parseFloat(page.totalAmount), 0);
        const activePagesCount = pages.filter(page => page.isActive).length;
        const averageTip = totalTips > 0 ? totalAmount / totalTips : 0;

        return {
            totalPages: totalPagesData as bigint || BigInt(0),
            totalTips,
            totalAmount,
            activePagesCount,
            averageTip
        };
    }, [totalPagesData]);

    // Load analytics data
    const loadAnalytics = useCallback(async () => {
        if (!creatorPagesData || !contract) return;

        try {
            setLoading(true);
            
            const pageIds = creatorPagesData as bigint[];
            const pages = await fetchPageDetails(pageIds);
            const stats = calculateStats(pages);

            setTipPages(pages);
            setContractStats(stats);
        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setLoading(false);
        }
    }, [creatorPagesData, contract, calculateStats, fetchPageDetails]);

    // Refresh data
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchTotalPages(),
                refetchCreatorPages()
            ]);
            await loadAnalytics();
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setRefreshing(false);
        }
    };

    // Load data when creator pages data changes
    useEffect(() => {
        loadAnalytics();
    }, [creatorPagesData, contract, loadAnalytics]);

    // Performance insights
    const performanceInsights = useMemo(() => {
        if (tipPages.length === 0) return null;

        const bestPage = tipPages.reduce((prev, current) => 
            (parseFloat(prev.totalAmount) > parseFloat(current.totalAmount)) ? prev : current
        );

        const averagePerPage = contractStats.totalAmount / tipPages.length;
        const activePages = tipPages.filter(p => p.isActive);
        
        return {
            bestPage,
            averagePerPage,
            activePages: activePages.length,
            inactivePages: tipPages.length - activePages.length,
            totalRevenue: contractStats.totalAmount
        };
    }, [tipPages, contractStats]);

    if (loading) {
        return (
            <TabsContent value="analytics" className="space-y-6">
                <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    Loading analytics...
                </div>
            </TabsContent>
        );
    }

    return (
        <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Last 30 Days
                    </Button>
                    <Button variant="outline" size="sm">
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Analytics Cards with real contract data */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            Total Pages
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {contractStats.totalPages?.toString() || "0"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {contractStats.activePagesCount} active pages
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Total Tips Received
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {contractStats.totalTips}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all pages
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {contractStats.totalAmount.toFixed(6)} STRK
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All-time earnings
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Tip</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {contractStats.averageTip.toFixed(6)} STRK
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per tip average
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Insights */}
            {performanceInsights && (
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Insights</CardTitle>
                        <CardDescription>Key metrics from your tip pages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-2">Best Performing Page</h4>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <p className="font-semibold">{performanceInsights.bestPage.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {performanceInsights.bestPage.totalAmount} STRK • {performanceInsights.bestPage.tipCount} tips
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Quick Stats</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Average per page:</span>
                                        <span className="font-medium">{performanceInsights.averagePerPage.toFixed(6)} STRK</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Active pages:</span>
                                        <span className="font-medium">{performanceInsights.activePages}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Inactive pages:</span>
                                        <span className="font-medium">{performanceInsights.inactivePages}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Page Performance with real contract data */}
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
                            {tipPages
                                .sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount))
                                .map((page) => (
                                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{page.name}</h4>
                                        <p className="text-sm text-gray-500 mb-2">{page.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{page.tipCount} tips</span>
                                            <span>Created: {page.createdAt}</span>
                                            <span>
                                                Avg: {page.tipCount > 0
                                                    ? (parseFloat(page.totalAmount) / page.tipCount).toFixed(6)
                                                    : "0.000000"} STRK
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
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    );
};

export default Analytics;