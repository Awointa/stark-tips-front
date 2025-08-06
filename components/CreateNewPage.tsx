import { TabsContent} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAccount } from "@starknet-react/core"

const CreateNewPage = ({pageName, setPageName, description, setDescription, goal, setGoal, handleCreatePage, isCreating}:{
    pageName: string,
    setPageName: (name: string) => void,
    description: string,
    setDescription: (description: string) => void,
    goal: string,
    setGoal: (goal: string) => void,
    handleCreatePage: () => void,
    isCreating: boolean,
}) => {
    const {account} = useAccount()

    return (
        <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Tip Page
                  </CardTitle>
                  <CardDescription>Set up a new tip page to start receiving support from your audience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pageName">Page Name *</Label>
                    <Input
                      id="pageName"
                      placeholder="e.g., Support My Art, Coffee Fund, Music Production"
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell your supporters what you're working on and how their tips will help..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal (Optional)</Label>
                    <Input
                      id="goal"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5.0"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Set a fundraising goal in ETH to show progress to supporters
                    </p>
                  </div>

                  <Button
                    onClick={handleCreatePage}
                    disabled={isCreating || !account}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isCreating ? "Creating Your Page..." : "Create Tip Page"}
                  </Button>

                  {!account && (
                    <p className="text-sm text-gray-500 text-center">
                      Please connect your wallet to create a tip page
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Tips for Success */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">💡 Tips for Success</CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 space-y-2 text-sm">
                  <p>
                    ✅ <strong>Clear page name:</strong> Make it obvious what you're raising funds for
                  </p>
                  <p>
                    ✅ <strong>Compelling description:</strong> Explain your project and how tips help
                  </p>
                  <p>
                    ✅ <strong>Set realistic goals:</strong> Start with achievable targets to build momentum
                  </p>
                  <p>
                    ✅ <strong>Share regularly:</strong> Post your link on social media, Discord, etc.
                  </p>
                  <p>
                    ✅ <strong>Thank supporters:</strong> Acknowledge tips to encourage more support
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
    )
}

export default CreateNewPage
