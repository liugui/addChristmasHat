import * as faceapi from 'face-api.js';

/**
 * 获取 K 值
 * @param {*} a
 * @param {*} b
 */
const getK = (a, b) => (a.x - b.x) / (a.y - b.y)

/**
 * 获取两点之间距离
 * @param {*} a
 * @param {*} b
 */
const getDistance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

/**
 * 已知 K，d, 点，求另一个点
 * @param {*} k 值
 * @param {*} d 距离
 * @param {*} point 一个基础点
 */
const getPos = (k, d, point) => {
  // 取 y 变小的那一边
  let y = -Math.sqrt((d * d) / (1 + k * k)) + point.y;
  let x = k * (y - point.y) + point.x;
  return { x, y };
};

/**
 * 获取头顶的坐标
 * @param {*} midPos 眉心点坐标
 * @param {*} jawPos 下巴底点坐标
 */
const getHeadPos = (midPos, jawPos) => {
  // 获取线的 k 值
  const k = getK(midPos, jawPos);
  // 获取眉心到下颌的距离
  const distanceOfEye2Jaw = getDistance(midPos, jawPos);
  return getPos(k, distanceOfEye2Jaw / 2, midPos);
};

const getFaceWith = outlinePoints => getDistance(outlinePoints[0], outlinePoints[outlinePoints.length - 1]);

const getFaceRadian = (jawPos, midPointOfEyebrows) =>
    Math.PI - Math.atan2(jawPos.x - midPointOfEyebrows.x, jawPos.y - midPointOfEyebrows.y);

function getImg(src, callback) {
  const img = new Image();
  img.setAttribute('crossOrigin', 'anonymous');
  img.src = src;
  img.onload = () => callback(img);
}

async function init() {
    await faceapi.nets.ssdMobilenetv1.load('/weights');
    await faceapi.loadFaceLandmarkModel('/weights');
    const input = document.querySelector('#img');
    const displaySize = {
        width: input.width,
        height: input.height
    };
    // 人脸识别的结果对象
    const detection = await faceapi.detectSingleFace(input).withFaceLandmarks();
    const resizedDetection = faceapi.resizeResults(detection, displaySize);
    // 面部五官识别的结果对象
    const landmarks = resizedDetection.landmarks;

    const jawOutline = landmarks.getJawOutline();  // 下巴轮廓

    const leftEyeBrow = landmarks.getLeftEyeBrow()[2];  // 左眉毛
    const rightEyeBrow = landmarks.getRightEyeBrow()[2];  // 右眉毛

    const midPos = {
        x: (leftEyeBrow.x + rightEyeBrow.x) / 2, 
        y: (leftEyeBrow.y + rightEyeBrow.y) / 2
    };
    const jawPos = jawOutline[8];

    console.log(midPos);
    console.log(jawPos);

    const headPos = getHeadPos(midPos, jawPos);
    console.log(headPos);

    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = input.width;
    canvas.height = input.height;
    input.style.display = 'none';
    canvas.style.display = 'block';

    ctx.drawImage(input, 0, 0, input.width, input.height, 0, 0, input.width, input.height);

    // faceapi.draw.drawDetections(canvas, resizedDetection);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
    const faceWidth = getFaceWith(jawOutline);
    const picSize = { width: faceWidth / 0.8, height: (faceWidth * 0.74) / 0.8 };
    const angle = getFaceRadian(midPos, jawPos);

    const hat = getImg('./hat.png', img => {
        // 保存画布
        ctx.save();
        // 画布原点移动到画帽子的地方
        ctx.translate(headPos.x, headPos.y);
        // 旋转画布到特定角度
        ctx.rotate(angle);
        // 我的圣诞帽子实际佩戴部分长度只有 0.75 倍整个图片长度
        ctx.drawImage(img, - picSize.width / 2, - picSize.height / 2, picSize.width, picSize.height)
        // 还原画布
        ctx.restore();
    });
};

init();