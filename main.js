import "./style.css";
import * as d3 from "d3";
// import * as d3 from "./public/package/d3.js";

const sleectElm1 = document.getElementById("pet-select-test");
const sleectElm2 = document.getElementById("pet-select-train");
const sleectElm3 = document.getElementById("pet-select-epoch");
sleectElm1.addEventListener("change", function () {
  showElm("test");
});

sleectElm2.addEventListener("change", function () {
  showElm("train");
});

sleectElm3.addEventListener("change", function () {
  showElm("epoch");
});
// const arr = new Array(55).fill(3.5)
// const arr1 = []
// arr.map((item, index)=>{
//     if(index >= 25){
//         arr1.push(index / 10)
//         // arr1.push(item)
//     }
// })
// let result = JSON.stringify(arr1)
// result = result.replace(/\[|\]|,/g, ' ')
// console.log(result);

// 初始化Vue实例
const vm = new Vue({
  data() {
    return {
      showData: {},
    };
  },
});
vm.$mount("#app"); //挂载到#app元素

// 拟合函数
function fitFunction(x) {
  // 替换以下系数值为具体的数值
  // 提供拟合参数（这些值需要根据你的 MATLAB 拟合结果进行替换）
  var p1 = 0.0004;
  var p2 = -0.0094;
  var p3 = 0.0883;
  var p4 = -0.4257;
  var p5 = 1.0938;
  var p6 = -1.3502;
  var p7 = 0.5047;
  var p8 = -0.0551;
  var p9 = 3.999;

  // 计算函数值
  const y =
    p1 * Math.pow(x, 8) +
    p2 * Math.pow(x, 7) +
    p3 * Math.pow(x, 6) +
    p4 * Math.pow(x, 5) +
    p5 * Math.pow(x, 4) +
    p6 * Math.pow(x, 3) +
    p7 * Math.pow(x, 2) +
    p8 * x +
    p9;

  return y;
}
// console.log(fitFunction(1));
// display mainsvg容器  未实现
function displayMainsvg(e) {
  const mainsvg = document.querySelectorAll("#mainsvg")[0];
  const isChecked = document.querySelectorAll(".checkBox")[0];
  console.log(isChecked.checked);
  if (isChecked.checked) {
    mainsvg.style.dispalay = "flex";
  } else {
    mainsvg.style.dispalay = "none";
  }
}

// 入口函数 获取json文件字符串 并调用主函数
async function showElm(str) {
  const selectElm = await document.querySelectorAll(`#pet-select-${str}`)[0];
  let dataString = selectElm.value;
  if(selectElm.value == '') return
  chooseData(dataString);
}

// 由当前JSON文件 决定 绘图配置 --速度  刻度划分  颜色 等等
function graphSetting(dataString, svgID) {
  const allDataString = {
    "resnet20_71.90_学生网络_DKD_cifar100训练集数据.json": 6,
    "resnet56教师网络cifar100训练集数据.json": 3,
    "resnet20_71.48_学生网络信息熵蒸馏cifar100训练集数据.json": 2,
    "resnet20_71.48_学生网络信息熵蒸馏cifar100测试集数据.json": 0,
    "resnet56教师网络cifar100测试集数据.json": 1,
    "baseKD_t[4.0]_resnet20_71.45_cifar100测试集数据.json": 4,
    "resnet20_DKD_71.9_cifar100测试集数据.json": 5,
    "resnet20_信息熵+DKD_72.30_cifar100测试集数据.json": 7,
  };
  // const color = ['green', 'blue', 'black', "steelblue", 'rgb(165, 151, 182)', 'red', '#00F7F5']
  const color = [
    "#FF0000",
    "#0000FF",
    "#00FF00",
    "#FFA500",
    "#800080",
    "#FFFF00",
    "#00FFFF",
    "#FFC0CB",
    "#FFD700",
    "#008080",
  ];
  const settingObj = {
    color: "",
    yScaleDomainMax: 0,
    yScaleDomainMinDetail: 0,
    yScaleDomainMaxDetail: 72,
    tickCount: 8,
    tickCountforchart4: 0,
    circleRadius: 0.3,
    circleOpacity: 1,
    yAxisisRight: 0,
    hasAnimation: true,
    lineWidth: 0.3,
    hiddenAxis: true,
  };
  settingObj.color = color[allDataString[dataString]];
  if (dataString.slice(-22, -5) == "dataForEveryEpoch") {
    // DKD_resnrt20_71.9_dataForEveryEpoch
    settingObj.color =
      dataString.slice(0, 6) == "baseKD"
        ? color[0]
        : (settingObj.color =
            dataString.slice(0, 3) == "DKD" ? color[1] : color[5]);
    settingObj.yScaleDomainMax = 100;
  } else {
    // if (dataString == 'resnet56教师网络cifar100训练集数据.json' || dataString == 'resnet20_71.48_学生网络信息熵蒸馏cifar100训练集数据.json') {
    if (dataString.slice(-10, -5) == "训练集数据") {
      // settingObj.color = color[0]
      if (svgID == "chart1" || svgID == "chart2") {
        settingObj.yScaleDomainMax = 20000;
      } else if (svgID == "chart3") {
        settingObj.yScaleDomainMax = 1;
      } else if (svgID == "chart4") {
        if (dataString.slice(15, 19) == "学生网络") {
          settingObj.yAxisisRight = 1;
          settingObj.yScaleDomainMax = 300;
          // settingObj.tickCount = 16
        } else {
          settingObj.yScaleDomainMax = 70;
          // settingObj.tickCount = 16
        }
      } else if (svgID == "chart5") {
        settingObj.yScaleDomainMax = 5.5;
        settingObj.tickCount = 16;
      }
      // } else if (dataString == 'resnet20_71.48_学生网络信息熵蒸馏cifar100测试集数据.json' || dataString == 'resnet56教师网络cifar100测试集数据.json') {
    } else if (dataString.slice(-10, -5) == "测试集数据") {
      // settingObj.color = color[1]
      if (svgID == "chart1") {
        settingObj.yScaleDomainMax = 3500;
      } else if (svgID == "chart2") {
        settingObj.yScaleDomainMax = 1400;
      } else if (svgID == "chart3") {
        settingObj.yScaleDomainMax = 1;
      } else if (svgID == "chart4") {
        settingObj.yScaleDomainMax = 70;
        settingObj.tickCount = 16;
      } else if (svgID == "chart5") {
        settingObj.yScaleDomainMax = 5.5;
        settingObj.tickCount = 16;
      }
    } else {
      alert("json文件不存在");
    }
  }
  return settingObj;
}

// 处理数据  计算各种所需数据
function handleInformationEntropy(informationEntropy) {
  let allWrongArr = new Array(100).fill(0); //每个类别错误的所有样本索引
  let arrForEveryOnePercentage = new Array(55).fill(0); // 每0.1区间有多少样本
  let arrForEveryOnePercentageToFixed2 = new Array(550).fill(0); // 每0.01区间有多少样本
  let arrJustyfyForCorrect = new Array(55).fill(0); // 每0.1区间分类正确的有多少样本
  let arrJustyfyForCorrectToFixed2 = new Array(550).fill(0); // 每0.01区间分类正确的有多少样本
  let arrJustyfyForCorrectToFixed3 = new Array(5500).fill(0); // 每0.001区间分类正确的有多少样本
  let arrForCorrectPercentage = new Array(55).fill(0); // 每0.1区间分类正确的样本所占比例
  let arrForCorrectPercentageToFixed2 = new Array(550).fill(0); // 每0.01区间分类正确的样本所占比例

  let min = 0;
  let max = 0;

  informationEntropy.forEach((item, index) => {
    if (item[0] > max) max = item[0];
    if (item[0] < min) min = item[0];

    let index_10 = 10 * +item[0].toFixed(1);
    let index_100 = Math.floor(100 * +item[0].toFixed(2));
    let index_1000 = Math.floor(1000 * +item[0].toFixed(3));
    if (index_10 <= 54) {
      arrForEveryOnePercentage[index_10]++;
    }
    if (index_100 <= 549) {
      arrForEveryOnePercentageToFixed2[index_100]++;
    }
    if (item[2]) {
      //如果样本分类正确
      arrJustyfyForCorrect[index_10]++;
      arrJustyfyForCorrectToFixed2[index_100]++;
      arrJustyfyForCorrectToFixed3[index_1000]++;
    }
  });

  // informationEntropy.forEach((item, index) => {
  //     if (!item[2]) {
  //         const indexString = `${index}`;
  //         allWrongArr[item[1]].push(indexString)
  //     }
  // })

  arrJustyfyForCorrect.forEach((item, index) => {
    arrForCorrectPercentage[index] = +(item / arrForEveryOnePercentage[index]);
  });
  // console.log("arrForCorrectPercentage[每0.1区间分类正确的样本所占比例]: ", arrForCorrectPercentage);
  arrJustyfyForCorrectToFixed2.forEach((item, index) => {
    arrForCorrectPercentageToFixed2[index] = +(
      item / arrForEveryOnePercentageToFixed2[index]
    ).toFixed(2);
    if (arrForCorrectPercentageToFixed2[index] == NaN)
      arrForCorrectPercentageToFixed2[index] = 0;
  });
  // console.log("arrForCorrectPercentageToFixed2[每0.01区间分类正确的样本所占比例]: ", arrForCorrectPercentageToFixed2);

  let indexArr = [];
  let itemArr = [];
  let itemArrStart = [];

  // 获取前entropy=2.4的数据 并将每0.1区间正确的比例由[0.7...,1]缩放至[0,4...]
  arrForCorrectPercentage.forEach((item, index) => {
    // if (index <= 24) {
    // itemArr.push(4.1 * Math.pow(item, 4.32))
    itemArr.push(fitFunction(index / 10));
    itemArrStart.push(item);
    indexArr.push(index / 10);
    // }
  });

  // 处理掉数组 [] 和 ，方便matlab拟合函数
  let result = JSON.stringify(itemArr);
  result = result.replace(/\[|\]|,/g, " ");

  // console.log(result);
  // console.log(indexArr, itemArr);
  // 原始的最小温度,截止entropy=2.5
  let minPercentageStart = itemArrStart.reduce((pre, current) => {
    return Math.min(pre, current);
  }, 10);
  // 放大后的最小温度,截止entropy=2.5
  let minPercentage = itemArr.reduce((pre, current) => {
    return Math.min(pre, current);
  }, 10);
  // console.log("放大后的最小温度,截止entropy=2.5: ", minPercentageStart);
  // console.log("放大后的最小温度,截止entropy=2.5: ", minPercentage);

  arrJustyfyForCorrect = arrJustyfyForCorrectToFixed2;
  const data = {
    arrForEveryOnePercentage,
    arrJustyfyForCorrect,
    arrForCorrectPercentage,
    min,
    max,
    itemArr,
  };
  return data;
}

// 准备比例尺 各种图形单元
function preparationData(min, max, dataString) {
  const svg = d3.select("#mainsvg");
  const width = 2540;
  const height = 1850;
  // const width = +svg.attr("width");
  // const height = +svg.attr("height");
  const margin = { top: 60, right: 30, bottom: 60, left: 150 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 创建一个比例尺来映射第二个元素到颜色
  const colorScale = d3
    .scaleSequential(
      // d3.interpolateViridis
      // d3.interpolateInferno
      // d3.interpolatePlasma
      // d3.interpolateMagma
      d3.interpolateWarm
    )
    .domain([0, 99]);

  const xScale = d3
    .scaleLinear()
    // .domain([min, max])
    .domain([0.0, 5.0])
    .range([0, +innerWidth]);
  const yScale = d3
    .scaleLinear()
    .domain([0, dataString.slice(-10, -5) == "训练集数据" ? 50000 : 10000])
    .range([0, +innerHeight]);

  const g = svg
    .append("g")
    .attr("id", "maingroup")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  return {
    svg,
    width,
    height,
    margin,
    innerWidth,
    innerHeight,
    colorScale,
    xScale,
    yScale,
    g,
  };
}

// 绘制 信息熵-样本 散点图
function drawScatterPlot(
  informationEntropy,
  innerWidth,
  innerHeight,
  colorScale,
  xScale,
  yScale,
  g
) {
  const xAxis = d3.axisBottom(xScale);
  g.append("g")
    .call(d3.axisBottom(xScale).ticks(40, "s"))
    .attr("transform", `translate(${0}, ${innerHeight})`);

  const yAxis = d3.axisLeft(yScale);
  g.append("g").call(yAxis);

  let mistakes = new Array(100).fill(0); //各个类别错误的个数

  informationEntropy.forEach((item, index) => {
    if (item[2] == 0) {
      mistakes[item[1]]++;
    }
    const cx = xScale(item[0]);
    const cy = yScale(index);
    const fill = colorScale(item[1]);
    const shape = item[2] === 1 ? "circle" : "square"; // 正方形形状

    if (shape === "circle") {
      // 创建圆
      g.append("circle")
        .attr("class", "active")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 1.5) // 圆的半径
        .style("fill", fill);
    } else {
      // 创建正方形，这里使用矩形的宽度和高度来控制大小
      const squareSize = 10; // 正方形的大小
      g.append("rect")
        .attr("class", "active")
        .attr("x", cx - squareSize / 2) // 居中正方形
        .attr("y", cy - squareSize / 2) // 居中正方形
        .attr("width", squareSize)
        .attr("height", squareSize)
        .style("fill", fill);
    }
  });

  // 创建一个g元素，用于包含绘图和网格背景
  // const g = svg.append("g");

  const xTicks = xScale.ticks(48); // 根据需要设置刻度数量

  xTicks.forEach((tick) => {
    g.append("line")
      .attr("x1", xScale(tick))
      .attr("y1", 0)
      .attr("x2", xScale(tick))
      .attr("y2", innerHeight) // 根据你的图形高度设置
      .attr("stroke-width", 0.3)
      .style("stroke", "red"); // 网格线颜色
  });

  const yTicks = yScale.ticks(48); // 根据需要设置刻度数量

  yTicks.forEach((tick) => {
    g.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(tick))
      .attr("x2", innerWidth) // 根据你的图形宽度设置
      .attr("stroke-width", 0.3)
      .attr("y2", yScale(tick))
      .style("stroke", "red"); // 网格线颜色
  });

  return mistakes;
}

// 处理训练日志数据
function handleTrainProcess(dataString) {
  d3.json(`/jsonData/${dataString}`).then((data) => {
    const test_acc = [];
    const test_acc_top5 = [];
    const best_acc = [];
    const newData = [];
    data.forEach((item, index) => {
      newData.push(item[0]);
    });
    newData.map((item, index) => {
      const epoch = item["epoch"];
      test_acc[epoch - 1] = item["test_acc"];
      test_acc_top5[epoch - 1] = item["test_acc_top5"];
      best_acc[epoch - 1] = item["best_acc"];
    });

    const dataObj = { test_acc, test_acc_top5, best_acc };
    handleDataObj(dataObj, dataString);
  });
}

// 处理模型评估数据
function moduleEvaluate(dataString) {
  d3.json(`/jsonData/${dataString}`).then((data) => {
    let informationEntropy = data.informationEntropy;

    const handleInformationEntropyOutput =
      handleInformationEntropy(informationEntropy);
    const {
      arrForEveryOnePercentage,
      arrJustyfyForCorrect,
      arrForCorrectPercentage,
      min,
      max,
      itemArr,
    } = handleInformationEntropyOutput;

    handleInformationEntropy(informationEntropy, min, max);

    const {
      svg,
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      colorScale,
      xScale,
      yScale,
      g,
    } = preparationData(min, max, dataString);

    const mistakes = drawScatterPlot(
      informationEntropy,
      innerWidth,
      innerHeight,
      colorScale,
      xScale,
      yScale,
      g
    );

    const dataObj = handleInnerText(
      arrForEveryOnePercentage,
      arrJustyfyForCorrect,
      arrForCorrectPercentage,
      mistakes,
      itemArr
    );

    handleDataObj(dataObj, dataString);
  });
}

// 数据嵌入vm, 计算分类错误最多的的样本 分类错误的样本数合计等
function handleInnerText(
  arrForEveryOnePercentage,
  arrJustyfyForCorrect,
  arrForCorrectPercentage,
  mistakes,
  itemArr
) {
  let sum = 0; //错误总数
  let maxWrongClass = 0;
  let maxWrong = 0;
  mistakes.forEach((item, index) => {
    sum = sum + item;
    if (item >= maxWrong) {
      maxWrong = item;
      maxWrongClass = index;
    }
  });
  // console.log("每0.1区间有多少样本: ", arrForEveryOnePercentage);
  // console.log("每0.1区间分类正确的有多少样本: ", arrJustyfyForCorrect);
  // console.log("每0.1区间分类正确的样本所占比例: ", arrForCorrectPercentage);
  // console.log("每个类别分类错误的样本数: ", mistakes);
  // console.log("分类错误最多的的样本: ", maxWrongClass, "错误数目: ", maxWrong);
  // console.log("分类错误的样本数合计: ", sum);

  vm.$set(vm.showData, "arrForEveryOnePercentage", arrForEveryOnePercentage);
  vm.$set(vm.showData, "arrJustyfyForCorrect", arrJustyfyForCorrect);
  vm.$set(vm.showData, "arrForCorrectPercentage", arrForCorrectPercentage);
  vm.$set(vm.showData, "mistakes", mistakes);
  vm.$set(vm.showData, "maxWrongClass", maxWrongClass);
  vm.$set(vm.showData, "maxWrong", maxWrong);
  vm.$set(vm.showData, "sum", sum);
  vm.$set(vm.showData, "itemArr", itemArr);

  // console.log(vm);
  const dataObj = {
    arrForEveryOnePercentage,
    arrJustyfyForCorrect,
    arrForCorrectPercentage,
    mistakes,
    itemArr,
  };
  return dataObj;
}

// 主函数 导入JSON数据 调用各个函数 清空画布
function chooseData(dataString) {
  // 清空主要的SVG画布
  const allSvgElm = d3.selectAll(".svgElm");
  if (dataString != "") {
    // 遍历并清空每个元素
    allSvgElm.each(function () {
      if (this.id == "mainsvg") {
        d3.select(this).selectAll("*").remove();
      }
    });

    if (dataString.slice(-22, -5) == "dataForEveryEpoch") {
      handleTrainProcess(dataString);
    } else {
      moduleEvaluate(dataString);
    }
  } else {
    alert("读取文件错误");
  }
}

// 绘制线段函数
function drawLine(dataObj, svgID, dataString) {
  let { data, text } = dataObj;
  const settingObj = graphSetting(dataString, svgID);
  const color = ["rgb(165, 151, 182)", "green", "blue", "black", "steelblue"];
  const duration = 2000;
  const delayDuration = 40; // 每个点的绘制间隔时间（毫秒）
  const delayDurationForClass = 19.2; // 每个点的绘制间隔时间（毫秒）
  // const tickCount = 0

  if (svgID == "chart3") {
    const newData = data.map((item) => {
      if (isNaN(item)) {
        return 0;
      } else {
        return item;
      }
    });
    data = newData;
  }

  vm.$set(vm.showData, "color", color);

  // 创建SVG元素
  var margin = { top: 20, right: 20, bottom: 50, left: 50 };
  var width = 820 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
  var svg = d3
    .select(`#${svgID}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  if (dataString.slice(-22, -5) == "dataForEveryEpoch") {
    if (svgID == "chart2") {
      // 创建x比例尺
      var xScale = d3
        .scaleLinear()
        // .domain([150, data.length - 1])
        .domain([0, data.length - 1])
        .range([0, width]);

      // 创建y比例尺
      var yScale = d3
        .scaleLinear()
        // .domain([0, settingObj.yScaleDomainMax])
        .domain([0, 100])
        .range([height, 0]);
    } else {
      // 创建x比例尺
      var xScale = d3
        .scaleLinear()
        // .domain([150, data.length - 1])
        .domain([0, data.length - 1])
        .range([0, width]);

      // 创建y比例尺
      var yScale = d3
        .scaleLinear()
        // .domain([0, settingObj.yScaleDomainMax])
        .domain([
          settingObj.yScaleDomainMinDetail,
          settingObj.yScaleDomainMaxDetail,
        ])
        .range([height, 0]);
    }
  } else {
    // 创建x比例尺
    var xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);

    // 创建y比例尺
    var yScale = d3
      .scaleLinear()
      .domain([0, settingObj.yScaleDomainMax])
      // .domain([settingObj.yScaleDomainMinDetail, settingObj.yScaleDomainMaxDetail])
      .range([height, 0]);
  }

  // 创建曲线生成器
  var line = d3
    .line()
    .x(function (d, i) {
      return xScale(i);
    })
    .y(function (d) {
      return yScale(d);
    })
    .curve(d3.curveLinear);

  // 添加路径元素
  const path = svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", settingObj.color)
    .attr("stroke-width", settingObj.lineWidth)
    .attr("d", line);

  if (settingObj.hasAnimation) {
    // 计算总的绘制时间
    const totalDuration = data.length * delayDuration;
    const totalDurationForClass = data.length * delayDurationForClass;

    //   当您想要实现折线图逐步绘制的效果时，可以按以下步骤操作：
    // 1. 设置折线的轮廓：首先，我们为折线设置了轮廓，通过 `stroke-dasharray` 和 `stroke-dashoffset` 属性来实现。这样，折线的实际线段是隐藏的，只有轮廓可见。
    // 2. 使用过渡效果：我们使用 D3.js 中的过渡效果（`transition`）来控制折线的绘制过程。过渡效果允许我们在一定时间内逐步更改属性的值。
    // 3. 绘制折线：在过渡效果中，我们设置了 `stroke-dashoffset` 属性，从初始值（与 `stroke-dasharray` 的值相同）逐渐减小到零，这样折线的轮廓逐渐变为实线，完成绘制。
    // 4. 绘制点并设置动画：同时，我们为每个数据点添加了圆圈表示，设置了透明度。初始时，这些点是不可见的（透明度为0），然后通过过渡效果，逐个点地将它们的透明度设置为1，实现了逐步绘制点的效果。
    // 5. 控制绘制速度：为了控制绘制速度，我们使用 `delay` 方法，根据数据点的索引来设置不同的延迟时间。这样，每个点都在一定的延迟后绘制出来，从而实现了逐步绘制的效果。
    // 通过这些步骤，您可以创建一个逐步绘制的折线图，让折线和数据点逐渐显示出来，而不是立即呈现在画布上。这种效果可以增强数据可视化的吸引力和可理解性。
    // 创建一个过渡效果
    path
      .attr("stroke-dasharray", function () {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(svgID == "chart4" ? totalDurationForClass : totalDuration) // 总的绘制时间
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0); // 最终将折线绘制完成

    // 添加点并设置动画
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "my-circle") // 添加 class 属性
      .attr("cx", (d, index) => xScale(index))
      .attr("cy", (d, index) => yScale(d))
      .attr("r", settingObj.circleRadius) // 点的半径
      .attr("fill", settingObj.color)
      .style("opacity", 0) // 初始时点的透明度为0
      .transition()
      .delay(
        (d, i) =>
          i * (svgID == "chart4" ? delayDurationForClass : delayDuration)
      ) // 根据索引延迟绘制点
      .duration(svgID == "chart4" ? totalDurationForClass : totalDuration) // 点的绘制时间
      .style("opacity", settingObj.circleOpacity); // 最终将点的透明度设置为1
  }

  // 创建x轴
  var xAxis = d3.axisBottom(xScale);
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .transition()
    .duration(duration)
    .call(
      xAxis.tickSize(0) //所有刻度
      // .tickSizeInner(10) //除了两头的刻度
      // .tickSizeOuter(0) //两头的刻度
    );

  // 创建y轴
  var yAxis =
    settingObj.yAxisisRight && svgID == "chart4"
      ? d3.axisRight(yScale)
      : d3.axisLeft(yScale);
  svg
    .append("g")
    .attr("class", "y-axis")
    .attr(
      "transform",
      settingObj.yAxisisRight && svgID == "chart4"
        ? "translate(" + width + ", 0)"
        : 0
    )
    .transition()
    .duration(duration)
    .call(
      yAxis.tickSize(0) //所有刻度
      // .tickSizeInner(10) //除了两头的刻度
      // .tickSizeOuter(0) //两头的刻度
    );

  if (settingObj.hiddenAxis) {
    // 隐藏坐标轴的线和路径，但保留刻度
    const arrpathdomain = d3.selectAll(".domain")._groups[0];
    arrpathdomain.forEach((item) => {
      d3.select(item).style("opacity", "0");
    });
    const arrline = d3.selectAll("line")._groups[0];
    arrline.forEach((item) => {
      d3.select(item).style("opacity", "0");
    });
  }

  // // 在轴的刻度文字上应用颜色样式
  d3.selectAll("text").style("fill", color[0]); // 设置刻度文字颜色为红色
  // yAxis.selectAll("text")
  //     .style("fill", "red"); // 设置刻度文字颜色为红色

  // 创建一个g元素，用于包含绘图和网格背景
  const g = svg.append("g");

  const xTicks = xScale.ticks(
    svgID == "chart4" ? settingObj.tickCountforchart4 : settingObj.tickCount
  ); // 根据需要设置刻度数量

  xTicks.forEach((tick) => {
    g.append("line")
      .attr("x1", xScale(tick))
      .attr("y1", 0)
      .attr("x2", xScale(tick))
      .attr("y2", height) // 根据你的图形高度设置
      .style("stroke", color[0]); // 网格线颜色
    // .style("opacity", 0) // 初始时点的透明度为0
    // .transition() // 添加过渡效果
    // .duration(duration) // 过渡的持续时间
    // .style("opacity", 1); // 最终将点的透明度设置为1
  });

  const yTicks = yScale.ticks(
    svgID == "chart4" ? settingObj.tickCountforchart4 : settingObj.tickCount
  ); // 根据需要设置刻度数量

  yTicks.forEach((tick) => {
    g.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(tick))
      .attr("x2", width) // 根据你的图形宽度设置
      .attr("y2", yScale(tick))
      .style("stroke", color[0]); // 网格线颜色
    // .style("opacity", 0) // 初始时点的透明度为0
    // .transition() // 添加过渡效果
    // .duration(duration) // 过渡的持续时间
    // .ease(d3.easeBounce)
    // .style("opacity", 1); // 最终将点的透明度设置为1
  });

  // 添加标题
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .text(`${text}`)
    .style("font-weight", 100)
    .style("letter-spacing", 2)
    .style("stroke", color[0]); // 标题颜色
}

// 调用绘制线段函数
function handleDataObj(dataObj, dataString) {
  if (dataString.slice(-22, -5) == "dataForEveryEpoch") {
    let { test_acc, test_acc_top5, best_acc } = dataObj;

    test_acc = {
      data: test_acc,
      text: "test_acc",
    };
    test_acc_top5 = {
      data: test_acc_top5,
      text: "test_acc_top5",
    };
    best_acc = {
      data: best_acc,
      text: "best_acc",
    };
    drawLine(test_acc, "chart1", dataString);
    drawLine(test_acc_top5, "chart2", dataString);
    drawLine(best_acc, "chart3", dataString);
  } else {
    let {
      arrForEveryOnePercentage,
      arrJustyfyForCorrect,
      arrForCorrectPercentage,
      mistakes,
      itemArr,
    } = dataObj;

    arrForEveryOnePercentage = {
      data: arrForEveryOnePercentage,
      text: "每0.1区间有多少样本",
    };
    arrJustyfyForCorrect = {
      data: arrJustyfyForCorrect,
      text: "每0.1区间分类正确的有多少样本",
    };
    arrForCorrectPercentage = {
      data: arrForCorrectPercentage,
      text: "每0.1区间分类正确的样本所占比例",
    };
    mistakes = {
      data: mistakes,
      text: "每个类别分类错误的样本数",
    };
    itemArr = {
      data: itemArr,
      text: "缩放后的温度曲线",
    };
    drawLine(arrForEveryOnePercentage, "chart1", dataString);
    drawLine(arrJustyfyForCorrect, "chart2", dataString);
    drawLine(arrForCorrectPercentage, "chart3", dataString);
    drawLine(mistakes, "chart4", dataString);
    drawLine(itemArr, "chart5", dataString);
  }
}

// 在页面加载完成后运行以下代码以删除所有script标签，防止页面出现script文本
window.addEventListener("load", function () {
  // 获取所有的script标签
  var scriptTags = document.getElementsByTagName("script");
  var styleTags = document.getElementsByTagName("style");

  // 遍历script标签，将它们的内容置为空
  for (var i = 0; i < scriptTags.length; i++) {
    scriptTags[i].textContent = "";
  }
  for (var i = 0; i < styleTags.length; i++) {
    styleTags[i].textContent = "";
  }
});

// 页面一加载即调用入口函数
document.addEventListener("DOMContentLoaded", function () {
  showElm(); // 在页面加载后运行 showElm() 一次
});
