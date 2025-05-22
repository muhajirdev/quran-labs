import { Logo } from "~/components/ui/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export function LogoUsageExamples() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Logo Usage Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Header Example */}
        <Card>
          <CardHeader>
            <CardTitle>Header Usage</CardTitle>
            <CardDescription>How to use the logo in headers and navigation</CardDescription>
          </CardHeader>
          <CardContent className="p-6 border-t">
            <div className="flex items-center gap-2 p-4 bg-background rounded-lg">
              <Logo size="sm" />
              <span className="font-medium">SuperQuran</span>
            </div>

            <div className="mt-6 flex items-center gap-2 p-4 bg-background rounded-lg">
              <Button asChild variant="ghost" className="flex items-center gap-2">
                <Link to="/logo-demo">
                  <Logo size="sm" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Card Example */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Card Usage</CardTitle>
            <CardDescription>Using the logo in feature cards and sections</CardDescription>
          </CardHeader>
          <CardContent className="p-6 border-t">
            <div className="rounded-lg bg-background p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Logo size="md" />
                </div>
                <h3 className="text-lg font-medium">AI-Powered Insights</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover deeper connections and insights with our advanced AI analysis tools.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Example */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Usage</CardTitle>
          <CardDescription>How to incorporate the logo in footers</CardDescription>
        </CardHeader>
        <CardContent className="p-6 border-t">
          <div className="bg-background p-6 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Logo size="md" />
                <div>
                  <h3 className="font-medium">SuperQuran</h3>
                  <p className="text-xs text-muted-foreground">Exploring Quranic knowledge through AI</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" size="sm">About</Button>
                <Button variant="ghost" size="sm">Contact</Button>
                <Button variant="ghost" size="sm">Privacy</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
