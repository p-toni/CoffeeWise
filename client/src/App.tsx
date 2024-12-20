import { Switch, Route } from "wouter";
import BrewingPage from "@/pages/Brewing";

function App() {
  return (
    <Switch>
      <Route path="/" component={BrewingPage} />
    </Switch>
  );
}

export default App;
