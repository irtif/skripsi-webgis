import React from "react";
import axios from "axios";
import swal from "sweetalert";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";

import "./style.css";

const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Maps(props) {
  const inputFile = (e) => {
    let form_data = new FormData();
    form_data.append("file", e.target.files[0]);
    axios
      .post("/file", form_data, { headers })
      .then((res) => {
        swal({
          title: "Success",
          text: "Data Uploaded Successfully",
          icon: "success",
          button: "Next",
        }).then((value) => {
          window.location.href = "/view";
        });
      })
      .catch((err) => {
        console.log(err);
        swal("Failed", "Network Errors", "error");
      });
    console.log(headers);
  };

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-panel">
        <Navbar />
        <div className="content">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Accident Analysis</h4>
                </div>
                <div className="card-body maps-body">
                  <div className="jumbotron jumbotron-fluid border bg-transparent">
                    <div className="container">
                      <center>
                        <input
                          type="file"
                          name="image"
                          id="image"
                          accept=".csv"
                          className="position-absolute mt-5"
                          onChange={inputFile}
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="100"
                          height="100"
                          viewBox="0 0 48 48"
                        >
                          <title>upload-file</title>
                          <g fill="#ffffff">
                            <path d="M16,15h6V33a2,2,0,0,0,4,0V15h6a1,1,0,0,0,.809-1.588l-8-11a1.038,1.038,0,0,0-1.618,0l-8,11A1,1,0,0,0,16,15Z"></path>
                            <path
                              d="M45.953,43.7l-7-22A1,1,0,0,0,38,21H30a1,1,0,0,0,0,2h7.269l6.364,20H4.367l6.364-20H18a1,1,0,0,0,0-2H10a1,1,0,0,0-.953.7l-7,22A1,1,0,0,0,3,45H45a1,1,0,0,0,.953-1.3Z"
                              fill="#ffffff"
                            ></path>
                          </g>
                        </svg>
                        <h6 className="display-5 mt-3 mb-5">
                          Enter the required data for analysis
                        </h6>
                        <div
                          className="container text-left text-light"
                          style={{ fontSize: "10px" }}
                        >
                          <p>Your file should contain: </p>
                          <ol>
                            <div className="row">
                              <div className="col-md-6">
                                <li>Address</li>
                                <li>District</li>
                                <li>Day, Date, Time</li>
                                <li>Vehicles Involved</li>
                                <li>Accident Types</li>
                              </div>
                              <div className="col-md-6">
                                <li>Victim/Suspect Age</li>
                                <li>Victim/Suspect Vehicle Type</li>
                                <li>Victim Number (MD, LB, LR)</li>
                                <li>Material Loss</li>
                              </div>
                            </div>
                          </ol>
                        </div>
                      </center>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Maps;
