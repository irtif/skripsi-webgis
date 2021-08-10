import React, {useEffect, useState} from "react";
import axios from 'axios'
import { Link } from "react-router-dom";

const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Sidebar(props) {
  const [move, setMove] = useState('')
  useEffect(() => {
    axios.get("/download", {headers}).then(res => {
      setMove('/view')
    }).catch(err => setMove('/input'))
  }, [])
  return (
    <div className="sidebar">
      <div className="sidebar-wrapper">
        <div className="logo">
          <Link
            to="/dashboard"
            className="simple-text logo-normal text-center font-weight-bold mt-1 mb-n3"
          >
            Welcome, Muliadi
          </Link>
        </div>
        <ul className="nav">
          <li className="active h6">
            <Link to="/dashboard">
              <i className="tim-icons icon-chart-pie-36"></i>
              <p>Dashboard</p>
            </Link>
          </li>
          <li>
            <Link to="/data">
              <i className="tim-icons icon-chart-bar-32"></i>
              <p>Data</p>
            </Link>
          </li>
          <li >
            <Link to={move}>
              <i className="tim-icons icon-square-pin"></i>
              <p>Accident Analysis</p>
              </Link>
          </li>
          <li>
            <a href="./notifications.html">
              <i className="tim-icons icon-refresh-01"></i>
              <p>History</p>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
