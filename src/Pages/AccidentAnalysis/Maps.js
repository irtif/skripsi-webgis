import React, { useEffect } from "react";
import axios from "axios";
import queryString from "query-string";

import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./style.css";

const headers = {
  "Content-Type": "application/json",
};

function Result(props) {
    // useEffect(() => {
    //   const { id, path } = queryString.parse(props.location.search);
    //   axios
    //     .post("/api/file/run", { path: path }, { headers })
    //     .then((res) => {
    //         console.log(res);
    //     })
    //     .catch((err) => console.log(err));
    // }, []);

    return (
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
    );
}

export default Result;
