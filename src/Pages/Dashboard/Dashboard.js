import React from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";

function Dashboard(props) {
  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main-panel">
        <Navbar />
        <div className="content">
          <div className="row">
            <div className="col-12">
              <div className="card card-chart">
                <div className="card-header ">
                  <div className="row">
                    <div className="col-sm-6 text-left">
                      <h5 className="card-category">Accident</h5>
                      <h2 className="card-title">Based on Location</h2>
                    </div>
                    <div className="col-sm-6">
                      <div
                        className="btn-group btn-group-toggle float-right"
                        data-toggle="buttons"
                      >
                        <label
                          className="btn btn-sm btn-primary btn-simple active"
                          id="0"
                        >
                          <input type="radio" name="options" checked />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            Accounts
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-single-02"></i>
                          </span>
                        </label>
                        <label className="btn btn-sm btn-primary btn-simple" id="1">
                          <input
                            type="radio"
                            className="d-none d-sm-none"
                            name="options"
                          />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            Purchases
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-gift-2"></i>
                          </span>
                        </label>
                        <label className="btn btn-sm btn-primary btn-simple" id="2">
                          <input type="radio" className="d-none" name="options" />
                          <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                            Sessions
                          </span>
                          <span className="d-block d-sm-none">
                            <i className="tim-icons icon-tap-02"></i>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="chart-area">
                    <canvas id="chartBig1"></canvas>
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

export default Dashboard;
