import { Switch, Route } from "wouter";
import { BrewingProvider } from "@/context/BrewingContext";
import BrewingPage from "@/pages/Brewing";

function App() {
  return (
    <BrewingProvider>
      <Switch>
        <Route path="/" component={BrewingPage} />
      </Switch>
    </BrewingProvider>
  );
}

export default App;
