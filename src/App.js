import { Route, Switch, BrowserRouter } from "react-router-dom";
import Login from "./Pages/AuthPages/Login";
import Register from "./Pages/AuthPages/Register";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Data from "./Pages/Data/Data";
import InputData from "./Pages/AccidentAnalysis/InputData";
// import Maps from './Pages/AccidentAnalysis/Maps'
import Maps2 from "./Pages/AccidentAnalysis/Maps2";
import ViewData from "./Pages/AccidentAnalysis/ViewData";

function App(props) {
  let token = localStorage.getItem("satlatic_token");
  let path = window.location.pathname;

  if (!token && path !== "/login") {
    window.location.href = "/login";
  }

  if (token) {
    let base64UrlToken = token.split(".")[1];
    let decodedValueToken = JSON.parse(window.atob(base64UrlToken));
    if (
      decodedValueToken.exp < new Date().getTime() / 1000 ||
      localStorage.getItem("satlatic_token") === null
    ) {
      console.log("token expired");
      localStorage.clear();
      window.location.reload();
    } else {
      console.log("token not expired");
    }
  }

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
          {/* <Route path="/maps" component={Maps} /> */}
          <Route path="/maps2" component={Maps2} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
