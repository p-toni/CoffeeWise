import { Switch, Route } from "wouter";
import BrewingPage from "@/pages/Brewing";
import BrewingHistory from "@/pages/BrewingHistory";

function App() {
  return (
    <Switch>
      <Route path="/" component={BrewingPage} />
      <Route path="/history" component={BrewingHistory} />
    </Switch>
  );
}

export default App;