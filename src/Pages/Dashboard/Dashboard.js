import React, { useEffect, useState } from "react";
import axios from "axios";
import { MDBContainer } from "mdbreact";
import LoadingOverlay from "react-loading-overlay-ts";
import { Line, Bar, HorizontalBar } from "react-chartjs-2";

import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Dashboard.css";

const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Dashboard(props) {
  const [loading, setLoading] = useState(false);
  const [victimData, setVictimData] = useState({});
  const [data, setData] = useState({});
  const [accTypes, setAccTypes] = useState({});
  const [vehicleTypes, setVhcTypes] = useState({});

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

        numberOfCase(data, columns);
        numberOfVictim(data);
        numberOfAccTypes(data);
        numberOfVhcTypes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const numberOfCase = (data, columns) => {
    let chartData = [];
    data.map((i) => {
      let check = new Date(i.date);
      let year = check.getFullYear();
      let month = check.getMonth() + 1;
      let checkYear = chartData.filter((data) => data.year === year);
      if (checkYear.length > 0 && !isNaN(year)) {
        let yearIndex = chartData.findIndex((x) => x.year === year);
        let checkMonth = checkYear[0].months.filter(
          (data) => data.month === month
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
      return
    });

    chartData.sort((a, b) => (a.year > b.year ? 1 : -1));
    chartData.map((x) => {
      if (x.months.length < 12) {
        x.months = Array.from(
          Array(12).keys(),
          (month) =>
            x.months.find((sale) => +sale.month === month + 1) || {
              month: month + 1,
              values: 0,
            }
        );
      }
      x.months.sort((a, b) => (a.month > b.month ? 1 : -1));
      return
    });
    let newArr = chartData.slice(Math.max(chartData.length - 5, 1));
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
        pointBorderColor: "rgb(205, 130, 158)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 7,
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
        pointBorderWidth: 7,
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
        borderColor: "rgb(156, 5, 111)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgb(156, 5, 111)",
        pointBackgroundColor: "rgb(255, 255, 255)",
        pointBorderWidth: 7,
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
      datasets[index] = temp;
      return
    });

    setData({
      labels: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ],

      datasets: datasets,
      barChartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              barPercentage: 1,
              gridLines: {
                display: true,
                color: "rgba(0, 0, 0, 1)",
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: "rgba(0, 0, 0, 1)",
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  };

  const numberOfVictim = (data) => {
    let chartData = [];
    data.map((i) => {
      let check = new Date(i.date);
      let year = check.getFullYear();
      let checkYear = chartData.filter((data) => data.year === year);
      if (checkYear.length > 0 && !isNaN(year)) {
        let yearIndex = chartData.findIndex((x) => x.year === year);
        i.LR.includes("-")
          ? console.log()
          : (chartData[yearIndex].LR += parseInt(i.LR));
        i.LB.includes("-")
          ? console.log()
          : (chartData[yearIndex].LB += parseInt(i.LB));
        i.MD.includes("-")
          ? console.log()
          : (chartData[yearIndex].MD += parseInt(i.MD));
      } else if (!isNaN(year)) {
        let temp = {};
        temp["year"] = year;
        temp["LR"] = i.LR === "-" ? 0 : parseInt(i.LR);
        temp["LB"] = i.LB === "-" ? 0 : parseInt(i.LB);
        temp["MD"] = i.MD === "-" ? 0 : parseInt(i.MD);
        chartData.push(temp);
      }
      return
    });

    chartData.sort((a, b) => (a.year > b.year ? 1 : -1));
    let newArr = chartData.slice(Math.max(chartData.length - 5, 1));

    let datasets = {
      labels: ["LB", "LR", "MD"],
      datasets: [
        {
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(155,231,91,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
      ],
    };

    newArr.map((x, index) => {
      let temp = datasets.datasets[index];
      temp["label"] = x.year;
      temp["data"] = [x.LB, x.LR, x.MD];
      datasets.datasets[index] = temp;
      return
    });

    setVictimData(datasets);
  };

  const numberOfAccTypes = (data) => {
    let chartData = [];
    data.map((i) => {
      let check = new Date(i.date);
      let year = check.getFullYear();
      let checkYear = chartData.filter((data) => data.year === year);
      if (checkYear.length > 0 && !isNaN(year)) {
        let yearIndex = chartData.findIndex((x) => x.year === year);

        if (i.accident_types in chartData[yearIndex]) {
          chartData[yearIndex][`${i.accident_types}`] += 1;
        } else {
          chartData[yearIndex][`${i.accident_types}`] = 0;
        }
      } else if (!isNaN(year)) {
        let temp = {};
        temp["year"] = year;
        temp[`${i.accident_types}`] = 0;
        chartData.push(temp);
      }
      return
    });

    chartData.sort((a, b) => (a.year > b.year ? 1 : -1));
    let columns = ["LL", "OC", "T", "TB", "TK", "TL", "TM"];

    chartData.map((data, index) => {
      columns.map((column) => {
        column in data ? console.log() : (chartData[index][column] = 0);
      });
      return
    });

    let newArr = chartData.slice(Math.max(chartData.length - 5, 1));
    let datasets = {
      labels: columns,
      datasets: [
        {
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(155,231,91,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
      ],
    };

    newArr.map((x, index) => {
      let temp = datasets.datasets[index];
      temp["label"] = x.year;
      temp["data"] = [x.LL, x.OC, x.T, x.TB, x.TK, x.TL, x.TM];
      datasets.datasets[index] = temp;
      return
    });

    setAccTypes(datasets);
  };

  const numberOfVhcTypes = (data) => {
    let chartData = [];
    data.map((i) => {
      let check = new Date(i.date);
      let year = check.getFullYear();
      let checkYear = chartData.filter((data) => data.year === year);
      if (checkYear.length > 0 && !isNaN(year)) {
        let yearIndex = chartData.findIndex((x) => x.year === year);
        if (i.victim_vehicle !== i.suspect_vehicle) {
          if (i.victim_vehicle in chartData[yearIndex]) {
            chartData[yearIndex][`${i.victim_vehicle}`] += 1;
          } else if (i.victim_vehicle !== "-") {
            chartData[yearIndex][`${i.victim_vehicle}`] = 1;
          }
          if (i.suspect_vehicle in chartData[yearIndex]) {
            chartData[yearIndex][`${i.suspect_vehicle}`] += 1;
          } else if (i.suspect_vehicle !== "-") {
            chartData[yearIndex][`${i.suspect_vehicle}`] = 1;
          }
        } else {
          if (i.victim_vehicle in chartData[yearIndex]) {
            chartData[yearIndex][`${i.victim_vehicle}`] += 1;
          } else if (i.victim_vehicle !== "-") {
            chartData[yearIndex][`${i.suspect_vehicle}`] = 1;
          }
        }
      } else if (!isNaN(year)) {
        let temp = {};
        temp["year"] = year;
        if (i.victim_vehicle !== i.suspect_vehicle) {
          i.victim_vehicle !== "-"
            ? (temp[`${i.victim_vehicle}`] = 1)
            : console.log();
          i.suspect_vehicle !== "-"
            ? (temp[`${i.suspect_vehicle}`] = 1)
            : console.log();
        } else {
          i.victim_vehicle !== "-"
            ? (temp[`${i.victim_vehicle}`] = 1)
            : console.log();
        }
        chartData.push(temp);
      }
      return
    });

    chartData.sort((a, b) => (a.year > b.year ? 1 : -1));
    let columns = ["B", "B1", "B2", "M", "R2", "R3", "R4", "Rro", "T", "TR"];

    chartData.map((data, index) => {
      chartData[index]["TR"] = 0;
      let temp = Object.keys(data).filter((k) => k.startsWith("R"));
      let passed = ["R2", "R3", "R4", "Rro"];
      temp = temp
        .filter((i) => !passed.includes(i))
        .map((i) => {
          chartData[index]["TR"] += data[i];
          delete chartData[index][`${i}`];
          return
        });

      columns.map((column) => {
        column in data ? console.log() : (chartData[index][column] = 0);
        return
      });
      return
    });

    let newArr = chartData.slice(Math.max(chartData.length - 5, 1));
    let datasets = {
      labels: columns,
      datasets: [
        {
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(155,231,91,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
        {
          backgroundColor: "rgba(0,232,240,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
        },
      ],
      
    };

    newArr.map((x, index) => {
      let temp = datasets.datasets[index];
      temp["label"] = x.year;
      temp["data"] = [x.B, x.B1, x.B2, x.M, x.R2, x.R3, x.R4, x.Rro, x.T, x.TR];
      datasets.datasets[index] = temp;
      return
    });

    setVhcTypes(datasets);
  };

  let options = {
    legend: {
      labels: {
        fontColor: "#d9d8d7",
      },
    },
    title: {
      display: true,
      fontColor: "#d9d8d7",
      text: "Accident Records",
    },
    scales: {
      yAxes: [
        {
          ticks: {
            // beginAtZero: true,
            fontColor: "#d9d8d7",
            fontSize: 10,
            stepSize: 50,
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            fontColor: "#d9d8d7",
            fontSize: 10,
          },
        },
      ],
    },
  };

  let barOptions = {
    responsive: true,
    legend: {
      display: false,
    },
    type: "bar",
    scales: {
      xAxes: [
        {
          stacked: true,
          ticks: {
            fontColor: "#d9d8d7",
            fontSize: 10,
          }
        },
      ],
      yAxes: [
        {
          stacked: true,
          ticks: {
            fontColor: "#d9d8d7",
            fontSize: 10
          },
        },
      ],
    },
  };

  return (
    <LoadingOverlay active={loading} spinner text="Loading your content...">
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
                      <h5 className="card-title font-weight-bold">ACCIDENT FREQUENCY</h5>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <MDBContainer>
                    <Line data={data} options={options} />
                  </MDBContainer>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6">
              <div class="card card-chart">
                <div class="card-header">
                  <h5 className="card-title font-weight-bold">NUMBER OF VICTIM</h5>
                </div>
                <div class="card-body">
                  <MDBContainer>
                    <Bar data={victimData} options={barOptions} />
                  </MDBContainer>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="card card-chart">
                <div class="card-header">
                  <h5 className="card-title font-weight-bold">ACCIDENT TYPES</h5>
                </div>
                <div class="card-body">
                  <div>
                    <MDBContainer>
                      <Bar data={accTypes} options={barOptions} />
                    </MDBContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div class="col-lg-12">
              <div class="card">
                <div class="card-header">
                  <h5 className="card-title font-weight-bold">VEHICLES INVOLVED</h5>
                </div>
                <div class="card-body">
                  <div>
                    <MDBContainer>
                      <HorizontalBar data={vehicleTypes} options={barOptions} />
                    </MDBContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </LoadingOverlay>
  );
}

export default Dashboard;
