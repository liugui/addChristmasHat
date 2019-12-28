import * as faceapi from 'face-api.js';

// ����ͼƬ�����ߴ磬����ʱ���Դ˳ߴ���Ϊ���Ż�׼
var maxSize = 400;

var canvas = document.querySelector('.canvas');
var ctx = canvas.getContext('2d');

// �����Ĵ�С������Ҫ����ͼƬ�������Ĵ�С�����ź��ͼƬ��С����һ��
var displaySize = {
    width: 0,
    height: 0
};

const setDisplaySize = imgSize => {
    const imgRatio = imgSize.width / imgSize.height;
    if (imgSize.width <= maxSize && imgSize.height <= maxSize) {
        displaySize.width = imgSize.width;
        displaySize.height = imgSize.height;
    } else {
        if (imgRatio >= 1) {
            displaySize.width = maxSize;
            displaySize.height = maxSize / imgRatio;
        } else {
            displaySize.height = maxSize;
            displaySize.width = maxSize * imgRatio;
        }
    }
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
};

const setWarning = text => {
    document.querySelector('.warning').innerText = text;
}

const getDistance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getFaceWith = outlinePoints => getDistance(outlinePoints[0], outlinePoints[outlinePoints.length - 1]);

function getImg(src, callback) {
  const img = new Image();
  img.src = src;
  img.onload = () => callback(img);
  img.onerror = () => {
      setWarning('ͼƬ����ʧ��');
  }
}

// ����ü�ĺ��°����ĵ�����꣬���㷢�������ĵ�����
const getHairCenter = (eyeCenter, jawCenter) => {
    let hairCenter = {x: 0, y: 0};
    hairCenter.x = (3 * eyeCenter.x - jawCenter.x) / 2;
    hairCenter.y = (3 * eyeCenter.y - jawCenter.y) / 2;
    return hairCenter;
}

async function addHatMain(img) {
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks();
    const resizedDetection = faceapi.resizeResults(detection, displaySize);

    const landmarks = resizedDetection.landmarks;
    const jawOutline = landmarks.getJawOutline();  // ��������
    const leftEyeBrow = landmarks.getLeftEyeBrow();  // ��üë
    const leftEyeBrowRight = leftEyeBrow[leftEyeBrow.length - 1]; // ��üë���ұߵĵ�
    const rightEyeBrow = landmarks.getRightEyeBrow();  // ��üë
    const rightEyeBrowLeft = rightEyeBrow[0]; // ��üë����ߵĵ�
    // ü������
    const eyeCenter = {
        x: (leftEyeBrowRight.x + rightEyeBrowLeft.x) / 2,
        y: (leftEyeBrowRight.y + rightEyeBrowLeft.y) / 2
    };
    // �°͵�����
    const jawCenter = jawOutline[Math.floor(jawOutline.length / 2)];
    const hairCenter = getHairCenter(eyeCenter, jawCenter);
    const faceWidth = getFaceWith(jawOutline);
    
    const angle = - Math.PI / 2 + Math.atan2(jawCenter.y - eyeCenter.y, jawCenter.x - eyeCenter.x);
    ctx.translate(hairCenter.x, hairCenter.y);
    ctx.rotate(angle);
    getImg('./hat.png', hat => {
        const hatImgWidth = faceWidth * 12 / 8;
        const hatImgHeight = hatImgWidth / hat.width * hat.height;
        ctx.drawImage(hat, 0, 0, hat.width, hat.height, - (hatImgWidth * 9 / 11 / 2), - hatImgHeight / 2, hatImgWidth, hatImgHeight);
    });
};

const loadResource = async () => {
    await faceapi.nets.ssdMobilenetv1.load('/weights');
    await faceapi.loadFaceLandmarkModel('/weights');
    document.querySelector('.loading').style.display = 'none';
}

const drawImageMain = img => {
    setDisplaySize({
        width: img.width,
        height: img.height
    });
    // ��ԭʼͼƬ
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, displaySize.width, displaySize.height);
    ctx.save();
    // ��ñ��
    addHatMain(img);
}

// ��������ʶ�������Դ
loadResource();

document.querySelector('.file-input').addEventListener('change', function(e) {
    let file = e.target.files && e.target.files[0];
    if (file.type.indexOf('image') > -1) {
        document.querySelector('.download-btn').setAttribute('disabled', 'true');
        document.querySelector('.file-input').setAttribute('disabled', 'true');
        getImg(URL.createObjectURL(file), img => {
            drawImageMain(img);
            document.querySelector('.download-btn').removeAttribute('disabled');
            document.querySelector('.file-input').removeAttribute('disabled');
        });
    } else {
        setWarning('���ϴ���ȷ��ʽ��ͼƬ');
    }
});

document.querySelector('.download-btn').addEventListener('click', function(e) {
    if (displaySize.width && displaySize.height) {
        let dom = document.createElement("a");
        dom.href = canvas.toDataURL("image/png");
        dom.download = new Date().getTime() + ".png";
        dom.click();
    } else {
        setWarning('�����ϴ�ͼƬ');
    }
})