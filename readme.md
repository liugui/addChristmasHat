基于face-api的头像加圣诞帽小应用

## 效果

![使用前](./test.jpeg) -> ![使用后](./test-result.png)

## 使用
```
npm i
npm run dev
npx http-server
```
然后打开运行http-server之后显示的地址

点击上传图片，通过计算后会识别图片的人脸，并自动戴上圣诞帽，可以下载到本地保存成图片

## 原理

基于face-api识别人脸，获得人脸的特征数据。根据识别结果计算发际线位置，然后将圣诞帽缩放，并计算角度，画上去。