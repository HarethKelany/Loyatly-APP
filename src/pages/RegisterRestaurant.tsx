import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Register Your Restaurant</h1>
        <p className="text-muted-foreground">Coming soon.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default RegisterRestaurant;
