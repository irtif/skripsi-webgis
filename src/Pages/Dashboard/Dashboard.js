import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Line } from "react-chartjs-2";
import { MDBContainer } from "mdbreact";
import axios from "axios";

const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Dashboard(props) {
  const [loading, setLoading] = useState(false);
  const [newData, setNewData] = useState({});
  const [data, setData] = useState({});

  useEffect(() => {
    setLoading(true);
    axios
      .get("/download", { headers })
      .then((res) => {
        let data = [];
        let cells = res.data.split("\n").map(function (el) {
          return el.split("/");
        });
        let columns = cells[0][0].split(",");
        cells.shift();
        cells.map((i) => {
          let arr = i[0]
            .split(",")
            .filter((e) => e && e !== ",")
            .map((i) => i.trim());
          data.push(
            Object.assign.apply(
              {},
              columns.map((v, i) => ({ [v.trim()]: arr[i] }))
            )
          );
          return "";
        });

        let years = [];
        let chartData = [];
        data.map((i) => {
          let check = new Date(i.date);
          let year = check.getFullYear();
          let month = check.getMonth() + 1;
          let checkYear = chartData.filter((data) => data.year == year);

          if (checkYear.length > 0 && !isNaN(year)) {
            let yearIndex = chartData.findIndex((x) => x.year === year);
            let checkMonth = checkYear[0].months.filter(
              (data) => data.month == month
            );
            if (checkMonth.length > 0) {
              let monthIndex = chartData[yearIndex].months.findIndex(
                (x) => x.month === month
              );
              chartData[yearIndex].months[monthIndex].values += 1;
            } else {
              chartData[yearIndex].months.push({ month: month, values: 1 });
            }
          } else if (!isNaN(year)) {
            let temp = {};
            temp["year"] = year;
            temp["months"] = [{ month: month, values: 1 }];
            chartData.push(temp);
          }
        });

        // chartData.map(x => x.months.sort((a, b) => (a.month > b.month ? 1 : -1)))
        chartData.sort((a, b) => (a.year > b.year ? 1 : -1));        
        chartData.map(x => {
          if(x.months.length<12){
            x.months = Array.from(Array(12).keys(), month => 
            x.months.find(sale => +sale.month === month+1) || { month: month+1, sale: 0 }
            );
        }
          x.months.sort((a, b) => (a.month > b.month ? 1 : -1))
        })
        let newArr = chartData.slice(Math.max(chartData.length - 5, 1));
        // let newArr = chartData.slice(0, 3)
        let datasets = [
          {
            fill: true,
            lineTension: 0.3,
            backgroundColor: "rgba(225, 204,230, .3)",
            borderColor: "rgb(205, 130, 158)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgb(205, 130,1 58)",
            pointBackgroundColor: "rgb(255, 255, 255)",
            pointBorderWidth: 10,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgb(0, 0, 0)",
            pointHoverBorderColor: "rgba(220, 220, 220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
          },
          {
            fill: true,
            lineTension: 0.3,
            backgroundColor: "rgba(184, 185, 210, .3)",
            borderColor: "rgb(35, 26, 136)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgb(35, 26, 136)",
            pointBackgroundColor: "rgb(255, 255, 255)",
            pointBorderWidth: 10,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgb(0, 0, 0)",
            pointHoverBorderColor: "rgba(220, 220, 220, 1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
          },
          {
            fill: true,
            lineTension: 0.3,
            backgroundColor: "rgba(184, 185, 210, .3)",
            borderColor: "rgb(35, 26, 136)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgb(35, 26, 136)",
            pointBackgroundColor: "rgb(255, 255, 255)",
            pointBorderWidth: 10,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgb(0, 0, 0)",
            pointHoverBorderColor: "rgba(220, 220, 220, 1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
          },
        ];
        newArr.map((x, index) => {
          let temp = datasets[index];
          temp["label"] = x.year;
          temp["data"] = x.months.map((i) => i.values);
          datasets[index] = temp
        });

        setData({
          labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          datasets: datasets
        })

        // let count = 0
        // chartData.map(x => x.months.map(y => count += y.values))
        // console.log(count)
        // let totalYears = years.filter((v, i, a) => a.indexOf(v) === i);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

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
                        <label
                          className="btn btn-sm btn-primary btn-simple"
                          id="1"
                        >
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
                        <label
                          className="btn btn-sm btn-primary btn-simple"
                          id="2"
                        >
                          <input
                            type="radio"
                            className="d-none"
                            name="options"
                          />
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
                <div class="card-body">
                  <MDBContainer>
                    <Line data={data} options={{ responsive: true }} />
                  </MDBContainer>
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
