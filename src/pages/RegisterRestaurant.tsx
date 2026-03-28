import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const RegisterRestaurant = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary">
            <Store className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl font-serif text-foreground">Register Your Restaurant</h1>
          <p className="text-muted-foreground">
            Restaurant registration is coming soon. We're building the tools to let you create and manage your own loyalty program.
          </p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterRestaurant;
