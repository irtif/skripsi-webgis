import { Route, Switch, BrowserRouter } from "react-router-dom";
import Login from "./Pages/AuthPages/Login";
import Register from "./Pages/AuthPages/Register";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Data from "./Pages/Data/Data";
import InputData from "./Pages/AccidentAnalysis/InputData";
import Maps from './Pages/AccidentAnalysis/Maps'
import ViewData from "./Pages/AccidentAnalysis/ViewData";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/data" component={Data} />

          <Route path="/input" component={InputData} />
          <Route path="/view" component={ViewData} />
            <Route path="/maps" component={Maps} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
