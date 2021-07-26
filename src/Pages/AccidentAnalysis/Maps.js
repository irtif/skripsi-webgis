import React, { useEffect, useState } from "react";
import axios from "axios";
import queryString from "query-string";
import LoadingOverlay from "react-loading-overlay-ts";

import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./style.css";

const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Result(props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const { id, path } = queryString.parse(props.location.search);
    let file_path = path.replace(".csv", "")
    axios
      .get(`execute/${file_path}`, { headers })
      .then((res) => {
          console.log(res);
          setLoading(true);
      })
      .catch((err) => {
        console.log(err)
        setLoading(true);
      });
  }, []);

  return (
    <LoadingOverlay active={loading} spinner text="Loading your content...">
      <div className="wrapper">
        <Sidebar />
        <div className="main-panel">
          <Navbar />
          <div className="content">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header pt-4">
                    <h3 className="card-title float-left font-weight-bold">
                      Result
                    </h3>
                  </div>
                  <div className="card-body"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoadingOverlay>
  );
}

export default Result;
