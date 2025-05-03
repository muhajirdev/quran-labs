import { Logo } from "~/components/ui/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function LogoDemo() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Crescent Logo</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crescent Logo</CardTitle>
            <CardDescription>Elegant crescent moon design</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <Logo size="lg" />
          </CardContent>
        </Card>
      </div>

      {/* Size Variants */}
      <h2 className="text-xl font-bold mt-12 mb-6">Size Variants</h2>
      <Card>
        <CardHeader>
          <CardTitle>Logo Sizes</CardTitle>
          <CardDescription>Small, Medium, and Large variants</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center gap-8 p-6">
          <div className="flex flex-col items-center">
            <Logo size="sm" />
            <span className="mt-2 text-sm text-muted-foreground">Small</span>
          </div>
          <div className="flex flex-col items-center">
            <Logo size="md" />
            <span className="mt-2 text-sm text-muted-foreground">Medium</span>
          </div>
          <div className="flex flex-col items-center">
            <Logo size="lg" />
            <span className="mt-2 text-sm text-muted-foreground">Large</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
