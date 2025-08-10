import { TabsContent} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAccount, useContract, useSendTransaction} from "@starknet-react/core"
import {  MY_CONTRACT_ABI } from "@/constants/abi/MyContract"
import {CONTRACT_ADDRESS} from "@/constants/index"


const CreateNewPage = ({pageName, setPageName, description, setDescription, goal, setGoal}:{
    pageName: string,
    setPageName: (name: string) => void,
    description: string,
    setDescription: (description: string) => void,
    goal: string,
    setGoal: (goal: string) => void,
}) => {
    const {account} = useAccount()
    const {contract} = useContract({
      abi:  MY_CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
    });

    // Setup the transaction hook - no calls defined initially
    const { send, error, isPending, isSuccess, reset } = useSendTransaction({ 
      calls: undefined, // We'll provide calls when we call send()
    });

    const handleCreatePage = () => {
      if (!pageName.trim()) {
        alert("Please enter a page name");
        return;
      }
      
      if (contract && account?.address && send) {
        // Create calls with current form data
        const calls = [contract.populate("create_tip_page", [
          account.address, // creator_address
          pageName, // page_name (current value)
          description || "" // description (current value)
        ])];
        send(calls); // Send transaction with fresh data
      }
    };

    // Reset error state when form values change
    const handlePageNameChange = (name: string) => {
      setPageName(name);
      if (error) reset();
    };

    const handleDescriptionChange = (desc: string) => {
      setDescription(desc);
      if (error) reset();
    };

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
                      onChange={(e) => handlePageNameChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell your supporters what you're working on and how their tips will help..."
                      value={description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
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

                  {/* Show error message if transaction fails */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">
                        Error creating tip page: {error.message}
                      </p>
                    </div>
                  )}

                  {/* Show success message */}
                  {isSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">
                        ✅ Tip page created successfully!
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleCreatePage}
                    disabled={isPending || !account || !pageName.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isPending ? "Creating Your Page..." : "Create Tip Page"}
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
                    ✅ <strong>Clear page name:</strong> Make it obvious what you&apos;re raising funds for
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