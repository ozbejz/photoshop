let h;
let w;

document.querySelector('input[type="file"]').addEventListener('change', function() {
  var url = URL.createObjectURL(this.files[0]);
  const ctx = document.getElementById("canvas").getContext("2d");
  const ctx1 = document.getElementById("canvas1").getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx1.clearRect(0, 0, canvas.width, canvas.height);
  let img = new Image();

  img.onload = () => {
    let scale_factor = Math.min(canvas.width / img.width, canvas.height / img.height);
    
    // Lets get the new width and height based on the scale factor
    let newWidth = img.width * scale_factor;
    let newHeight = img.height * scale_factor;
        
    // get the top left position of the image
    // in order to center the image within the canvas
    let x = (canvas.width / 2) - (newWidth / 2);
    let y = (canvas.height / 2) - (newHeight / 2);
    
    // When drawing the image, we have to scale down the image
    // width and height in order to fit within the canvas
    ctx.drawImage(img, x, y, newWidth, newHeight);
    ctx1.drawImage(img, x, y, newWidth, newHeight);
    let imgData = ctx.getImageData(0, 0, img.width, img.height);
    let data = imgData.data;
    makeHistogram(data);
    w = img.width;
    h = img.height;
  };
  img.src = url;
});

document.getElementById("invert").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  invert(imgData);
})

document.getElementById("grayscale").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  grayscale(imgData);
})

document.getElementById("treshold").addEventListener("click", ()=>{
  let val = document.getElementById("treshold").value;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  setTreshold(imgData, val);
})

document.getElementById("box").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let data = imgData.data;
  kernelFunc(data, w, h, [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],9);
  ctx.putImageData(imgData, 0, 0);
})

document.getElementById("guassian").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let data = imgData.data;
  kernelFunc(data, w, h, [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ],
  16);
  ctx.putImageData(imgData, 0, 0);
})

document.getElementById("laplace").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let data = imgData.data;
  kernelFunc(data, w, h, [
    [0, 1, 0],
    [1, -4, 1],
    [0, 1, 0],
  ],
  1);
  ctx.putImageData(imgData, 0, 0);
})

document.getElementById("sobel").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let data = imgData.data;
  let tmpData1 = data.slice();
  let tmpData2 = data.slice();
  kernelFunc(tmpData1, w, h, [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ],
  1);
  kernelFunc(tmpData2, w, h, [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ],
  1);
  joinSobel(tmpData1, tmpData2, data);
  ctx.putImageData(imgData, 0, 0);
})

document.getElementById("sharpening").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let data = imgData.data;
  let robovi = data.slice();
  kernelFunc(robovi, w, h, [
    [0, 1, 0],
    [1, -4, 1],
    [0, 1, 0],
  ],
  1);
  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) {
      continue;
    } // preskoci alfa kanal
    data[i] = data[i] - robovi[i];
    if (data[i] > 255) data[i] = 255;
    if (data[i] < 0) data[i] = 0;
  }
  ctx.putImageData(imgData, 0, 0);
})

document.getElementById("unsharp").addEventListener("click", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let data = imgData.data;
  const blur = data.slice();
  kernelFunc(blur, w, h, [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  9);
  const origMinusBlur = data.slice();

  // odstej blur od originala
  for (let i = 0; i < data.length; i++) {
    // preskoci alfa kanal
    if ((i + 1) % 4 === 0) {
      origMinusBlur[i] = data[i];
      continue;
    }

    if (data[i] - blur[i] >= 0) origMinusBlur[i] = data[i] - blur[i];
    else origMinusBlur[i] = 0;
  }

  // originalu pristej origMinusBlur
  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) {
      continue;
    } // preskoci alfa kanal
    data[i] = data[i] + origMinusBlur[i];
    if (data[i] > 255) data[i] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
})

document.getElementById("rdec").addEventListener("input", ()=> {
  let val = document.getElementById("rdec").value;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  povdarek(imgData, val, 'rdec');
})

document.getElementById("moder").addEventListener("input", ()=> {
  let val = document.getElementById("moder").value;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  povdarek(imgData, val, 'moder');
})

document.getElementById("zelen").addEventListener("input", ()=> {
  let val = document.getElementById("zelen").value;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  povdarek(imgData, val, 'zelen');
})

document.getElementById("ozelen").addEventListener("click", ()=> {
  let val = 0;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  povdarek(imgData, val, 'zelen');
})

document.getElementById("ordec").addEventListener("click", ()=> {
  let val = 0;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  povdarek(imgData, val, 'rdec');
})

document.getElementById("omoder").addEventListener("click", ()=> {
  let val = 0;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  povdarek(imgData, val, 'moder');
})

document.getElementById("ponastavi").addEventListener("click", ()=> {
  const img = new Image();
  const ctx = document.getElementById("canvas").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let ctx1 = document.getElementById("canvas1").getContext("2d");
  ctx1.clearRect(0, 0, canvas.width, canvas.height);
  let data = imgData.data;
  makeHistogram(data);
  ctx1.drawImage(img, 0, 0);
  ctx1.putImageData(imgData, 0, 0);
})

document.getElementById("brightness").addEventListener("input", ()=>{
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  let imgData = ctx.getImageData(0, 0, w, h);
  let val = document.getElementById("brightness").value;
  brightness(imgData, val);
})

const povdarek = (imgData, val, bar) => {
  let data = imgData.data;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  for (let i = 0; i < data.length; i += 4) {
    switch(bar){
      case 'rdec':
        data[i] = val;
        break;
      case 'zelen':
        data[i+1] = val;
        break;
      case 'moder':
        data[i+2] = val;
        break;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

const grayscale = (imgData) => {
  let data = imgData.data;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  ctx.drawImage(img, 0, 0);
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.299 * data[i] + 0.587 * data[i] + 0.114 * data[i];
    data[i] = avg; // red
    data[i + 1] = avg; // green
    data[i + 2] = avg; // blue
  }
  ctx.putImageData(imgData, 0, 0);
  makeHistogram(data);
};

const invert = (imgData) => {
  let data = imgData.data;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  ctx.drawImage(img, 0, 0);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; // red
    data[i + 1] = 255 - data[i + 1]; // green
    data[i + 2] = 255 - data[i + 2]; // blue
  }
  ctx.putImageData(imgData, 0, 0);
  makeHistogram(data);
};

const setTreshold = (imgData, threshold) => {
  let data = imgData.data;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  ctx.drawImage(img, 0, 0);
  for (let i = 0; i < data.length; i = i + 4) {
    let val = 0.299 * data[i] + 0.587 * data[i] + 0.114 * data[i];
    val = val > threshold ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);
  makeHistogram(data);
}

const brightness = (imgData, val) => {
  console.log(val);
  let data = imgData.data;
  const img = new Image();
  const ctx = document.getElementById("canvas1").getContext("2d");
  ctx.drawImage(img, 0, 0);
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i] * Math.sqrt(val);
  }
  ctx.putImageData(imgData, 0, 0);
  makeHistogram(data);
}

const kernelFunc = (data, width, height, kernel, div) => {
  const realWidth = 4 * width;
  const edgeOffset = (kernel.length - 1) / 2;

  // temporary table da ne unicis originala
  let res = [];

  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) {
      res[i] = data[i];
      continue;
    } // preskoci alfa kanal

    const x = Math.floor(i / 4) % width;
    const y = Math.floor(i / realWidth);

    const orig = [];

    for (let a = -edgeOffset; a <= edgeOffset; a++) {
      orig.push([]);
      for (let b = -edgeOffset; b <= edgeOffset; b++) {
        orig[orig.length - 1].push(data[i + a * realWidth + b * 4]);
      }
    }

    if (
      x + edgeOffset >= width ||
      x < edgeOffset ||
      y + edgeOffset >= height ||
      y < edgeOffset
    ) {
      res[i] = data[i];
    }

    if (!res[i]) res[i] = mulConvWPic(kernel, orig) / div;
  }

  // save new data
  for (let i = 0; i < res.length; i++) {
    data[i] = res[i];
  }
  makeHistogram(data);
}

function mulConvWPic(conv, pic) {
  let res = 0;
  for (let i = 0; i < conv.length; i++) {
    for (let j = 0; j < conv[i].length; j++) {
      if (pic[i][j] == -1) continue; // edges

      res += conv[i][j] * pic[i][j];
    }
  }

  return res;
}

function joinSobel(data1, data2, data) {
  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) continue; // preskoci alfa kanal
    data[i] = data1[i] + data2[i];
  }
}


function makeHistogram(data) {
  const buckets = generateBucketsByColor(data, 5);

  let chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    theme: "dark2",
    title: {
      text: "Histogram",
    },
    axisX: {
      title: "Buckets",
    },
    axisY: {
      title: "No. of pixels",
    },
    data: [
      {
        type: "column",
        name: "red",
        legendText: "red",
        color: "red",
        showInLegend: true,
        dataPoints: buckets["R"],
      },
      {
        type: "column",
        name: "green",
        legendText: "green",
        color: "green",
        showInLegend: true,
        dataPoints: buckets["G"],
      },
      {
        type: "column",
        name: "blue",
        legendText: "blue",
        color: "blue",
        showInLegend: true,
        dataPoints: buckets["B"],
      },
    ],
  });

  chart.render();
}

function generateBucketsByColor(data, numOfBuckets) {
  let range = Math.floor(255 / numOfBuckets);
  let buckets = { R: {}, G: {}, B: {} };

  for (let i = 0; i < numOfBuckets; i++) {
    buckets["R"][i] = 0;
    buckets["G"][i] = 0;
    buckets["B"][i] = 0;
  }

  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) {
      continue;
    } // preskoci alfa kanal

    let bucket = Math.floor(data[i] / range);
    if (bucket >= numOfBuckets) bucket = numOfBuckets - 1;

    if ((i + 1) % 4 == 1) {
      // R
      buckets["R"][bucket]++;
    } else if ((i + 1) % 4 == 2) {
      // G
      buckets["G"][bucket]++;
    } else if ((i + 1) % 4 == 3) {
      // B
      buckets["B"][bucket]++;
    }
  }

  let chartBuckets = { R: [], G: [], B: [] };

  for (const [color, tmpBuckets] of Object.entries(buckets)) {
    for (const [bucket, amount] of Object.entries(tmpBuckets)) {
      const startVal = bucket === 0 ? range * bucket : range * bucket + 1;
      const endVal = startVal + range - 1;

      chartBuckets[color].push({
        label: `${startVal}-${endVal}`,
        y: amount,
        // x: startVal,
      });
    }
  }
  return chartBuckets;
}