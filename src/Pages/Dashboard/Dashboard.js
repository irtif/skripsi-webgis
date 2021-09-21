import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Line, Bar } from "react-chartjs-2";
import { MDBContainer } from "mdbreact";
import axios from "axios";
import "./Dashboard.css";

const headers = {
  "Content-Type": "application/json",
  "x-access-token": localStorage.getItem("satlatic_token"),
};

function Dashboard(props) {
  const [loading, setLoading] = useState(false);
  const [newData, setNewData] = useState({});
  const [victimData, setVictimData] = useState({});
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

        numberOfCase(data, columns);
        numberOfVictim(data);
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
    chartData.map((x) => {
      if (x.months.length < 12) {
        x.months = Array.from(
          Array(12).keys(),
          (month) =>
            x.months.find((sale) => +sale.month === month + 1) || {
              month: month + 1,
              sale: 0,
            }
        );
      }
      x.months.sort((a, b) => (a.month > b.month ? 1 : -1));
    });
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

  let victimOptions = {
    responsive: true,
    legend: {
      display: false,
    },
    type: "bar",
    scales: {
      xAxes: [
        {
          stacked: true,
        },
      ],
      yAxes: [
        {
          stacked: true,
        },
      ],
    },
  };

  const numberOfVictim = (data) => {
    let chartData = [];
    data.map((i) => {
      let check = new Date(i.date);
      let year = check.getFullYear();
      let month = check.getMonth() + 1;
      let checkYear = chartData.filter((data) => data.year == year);
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
        temp["LR"] = i.LR == "-" ? 0 : parseInt(i.LR);
        temp["LB"] = i.LB == "-" ? 0 : parseInt(i.LB);
        temp["MD"] = i.MD == "-" ? 0 : parseInt(i.MD);
        chartData.push(temp);
      }
    });
    chartData.sort((a, b) => (a.year > b.year ? 1 : -1));
    let newArr = chartData.slice(Math.max(chartData.length - 5, 1));
    console.log(newArr);

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
    });

    setVictimData(datasets);
  };

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
                  <h5 class="card-category">Number of Victim</h5>
                </div>
                <div class="card-body">
                  <MDBContainer>
                    <Bar data={victimData} options={victimOptions} />
                  </MDBContainer>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="card card-chart">
                <div class="card-header">
                  <h5 class="card-category">Accident Types</h5>
                  {/* <h3 class="card-title"><i class="tim-icons icon-delivery-fast text-info"></i> 3,500€</h3> */}
                </div>
                <div class="card-body">
                  <div class="chart-area">
                    {/* <canvas id="CountryChart"></canvas> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div class="col-lg-4">
              <div class="card card-chart">
                <div class="card-header">
                  <h5 class="card-category">Vehicles Involved</h5>
                  {/* <h3 class="card-title"><i class="tim-icons icon-send text-success"></i> 12,100K</h3> */}
                </div>
                <div class="card-body">
                  <div class="chart-area">
                    {/* <canvas id="chartLineGreen"></canvas> */}
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
