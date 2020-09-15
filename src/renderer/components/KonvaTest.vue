<template>
  <div>
    <div
      class="container"
      ref="container"
    >
      <div class="tools">
        <input
          type="file"
          @change="handleLoadImage"
        />
        <button @click="handleRotate(90)"><i class="el-icon-refresh-right"></i></button>
        <button @click="handleRotate(-90)"><i class="el-icon-refresh-left"></i></button>
        <button @click="handleCircle">圆形</button>
        <button @click="handleClip">裁剪</button>
        <button @click="handleTest">save</button>
      </div>
      <div
        class="content"
        ref="content"
      >
        <div
          id="stage"
          ref="editArea"
        ></div>
      </div>

    </div>
    <div id="menu">
      <div class='box'>
        <button id="pulse-button">Pulse</button>
        <button id="delete-button">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
import Konva from "Konva";
export default {
  name: "konva-test",
  data() {
    return {
      stage: {
        obj: null,
        width: 0,
        height: 0,
      },
      layer: {
        obj: null,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      },
      group: {
        obj: null,
        width: 0,
        height: 0,
        Xscale: 1,
        Yscale: 1,
      },
      image: {
        obj: null,
        element: null,
        width: 0,
        height: 0,
      },
      scale: 1,   // stage 缩放比例
      degrees: 0, // 旋转角度累计
      clickCircle: false,
      doDrawing: false,
      mousePosition: {
        startPositionX: 0,
        startPositionY: 0,
        endPositionX: 0,
        endPositionY: 0,
      },
      circlePosition: {
        x: 0,
        y: 0,
      },
      // 圆id
      circleId: '',
      menuNode: null,
      currentShape: null,
      resizeTimer: null
    };
  },
  created() { },
  mounted() {
    this.initEvent()
  },
  methods: {
    initEvent() {
      this.menuNode = document.getElementById('menu')
      window.addEventListener('click', () => {
        this.menuNode.style.display = 'none'
      })

      // 监听删除事件
      document.getElementById('delete-button').addEventListener('click', () => {
        this.currentShape.destroy();
        this.layer.obj.draw();
      });

      // 监听页面尺寸变化 
      window.addEventListener('resize', this.resize);
    },
    // 重置大小
    resize() {
      if (this.resizeTimer) clearTimeout(this.resizeTimer)

      this.resizeTimer = setTimeout(() => {
        this.resizeDraw()
      }, 400);
    },
    resizeDraw() {
      let { offsetWidth, offsetHeight } = this.$refs.content
      let { obj: stage } = this.stage
      let { obj: layer } = this.layer

      this.stage.width = offsetWidth
      this.stage.height = offsetHeight

      stage.width(offsetWidth)
      stage.height(offsetHeight)
      stage.scaleX(1)
      stage.scaleY(1)

      stage.offsetX(offsetWidth / 2)
      stage.offsetY(offsetHeight / 2)
      stage.x(offsetWidth / 2)
      stage.y(offsetHeight / 2)

      let size = this.resetImageSize(this.degrees)
      let { Xscale, Yscale, x, y } = size


      this.group.obj.scaleX(Xscale)
      this.group.obj.scaleY(Yscale)
      layer.x(x)
      layer.y(y)


      stage.draw()

    },
    handleTest() {
      let stage = this.stage.obj
      let layer = this.layer.obj
      let group = this.group.obj
      let content = group.toDataURL({ mimeType: "image/jpeg", quality: 1, pixelRatio: 2 });
      let fileName = '框框'



      //   var base64ToBlob = function (code) {
      //     let parts = code.split(';base64,');
      //     let contentType = parts[0].split(':')[1];
      //     let raw = window.atob(parts[1]);
      //     let rawLength = raw.length;
      //     let uInt8Array = new Uint8Array(rawLength);
      //     for (let i = 0; i < rawLength; ++i) {
      //       uInt8Array[i] = raw.charCodeAt(i);
      //     }
      //     return new Blob([uInt8Array], {
      //       type: contentType
      //     });
      //   };

      //   let aLink = document.createElement('a');
      //   let blob = base64ToBlob(content); //new Blob([content]);
      //   let evt = document.createEvent("HTMLEvents");
      //   evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      //   aLink.download = fileName;
      //   aLink.href = URL.createObjectURL(blob);
      //   aLink.click()


      let link = document.createElement('a');
      link.download = fileName;
      link.href = content;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      //   delete link;

    },
    // 选择图片
    handleLoadImage(e) {
      var url = URL.createObjectURL(e.target.files[0]);
      this.start(url);
    },
    // 实例舞台
    mapToMakeStage() {
      let { offsetWidth, offsetHeight } = this.$refs.content

      if (this.stage.obj)
        this.stage.obj.remove()

      let stage = new Konva.Stage({
        container: "stage",
        width: offsetWidth,
        height: offsetHeight,
      });

      this.stage.obj = stage
      this.stage.width = offsetWidth
      this.stage.height = offsetHeight
    },
    // 实例层
    mapToMakeLayer() {
      let { obj: stage } = this.stage
      let layer = new Konva.Layer({ draggable: true })
      stage.add(layer)
      this.layer.obj = layer
    },
    // 实例组
    mapToMakeGroup() {
      let { obj: layer } = this.layer
      let size = this.resetImageSize()

      let group = new Konva.Group({
        width: size.width,
        height: size.height,
      })

      layer.add(group)
      this.group.width = size.width
      this.group.height = size.height
      this.group.obj = group

    },
    // 实例图片
    mapToMakeImageShape() {
      let { element } = this.image;
      let { width, height } = this.group

      let image = new Konva.Image({
        image: element,
        width: width,
        height: height,
      });

      this.group.obj.add(image);
      this.image.obj = image;
    },
    // 设置图片初始值
    async mapToLoadElement(url) {
      let image = await this.asyncLoadImage(url)
      this.image.element = image;
      this.image.width = image.width;
      this.image.height = image.height;
    },
    // new image
    asyncLoadImage(url) {
      return new Promise((resolve, reject) => {
        var image = new Image();
        image.src = url;
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('could not load image'))
      });
    },

    async start(file) {
      await this.mapToLoadElement(file)
      this.mapToMakeStage()
      this.mapToMakeLayer()
      this.mapToMakeGroup()
      this.mapToMakeImageShape()

      this.layer.obj.x(this.layer.x)
      this.layer.obj.y(this.layer.y)
      this.layer.obj.draw();

      let stage = this.stage.obj
      let layer = this.layer.obj

      stage.on("wheel", (evt) => {
        this.handleMouseZoom(evt)
      })

      layer.on('mousedown', (e) => {
        this.handleMouseDown(e)
      })

      layer.on('mouseup', (e) => {
        this.handleMouseUp(e)
      })

      layer.on('mousemove', (e) => {
        this.handleMouseMove(e)
      })
    },

    // 点击工具栏 -> 圆
    handleCircle() {
      let date = new Date()
      this.clickCircle = true
      this.circleId = "circle" + date.getTime()
      this.controllStage(false)
    },

    // 画圆
    drawing() {
      let circleId = this.circleId
      let { startPositionX, startPositionY, endPositionX, endPositionY } = this.mousePosition

      if (this.group.obj.find(`#${this.circleId}`)) {
        this.group.obj.find(`#${this.circleId}`).remove()
      }

      let circle = null
      let radius = Math.sqrt((endPositionX - startPositionX) * (endPositionX - startPositionX) + (endPositionY - startPositionY) * (endPositionY - startPositionY));
      circle = new Konva.Circle({
        x: this.circlePosition.x / this.scale,
        y: this.circlePosition.y / this.scale,
        radius: radius,
        stroke: 'red',
        strokeWidth: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        id: this.circleId,
        draggable: true,
      });

      circle.on("contextmenu", (e) => {
        e.evt.preventDefault();
        let { obj: stage } = this.stage
        this.currentShape = e.target;
        this.menuNode.style.display = 'initial';
        var containerRect = stage.container().getBoundingClientRect();
        this.menuNode.style.top =
          containerRect.top + stage.getPointerPosition().y + 4 + 'px';
        this.menuNode.style.left =
          containerRect.left + stage.getPointerPosition().x + 4 + 'px';
      })

      if (circle) {
        this.group.obj.add(circle)
        this.layer.obj.draw();
      }
    },

    // 控制layer 拖拽
    controllStage(type) {
      this.layer.obj.draggable(type)
      this.layer.obj.batchDraw();
    },

    // 旋转
    handleRotate(degrees) {
      this.degrees += degrees
      let layer = this.layer.obj

      let { content } = this.$refs;
      let { offsetHeight, offsetWidth } = content;

      if (Math.abs(this.degrees) == 360) this.degrees = 0

      let size = this.resetImageSize(this.degrees)
      let { Xscale, Yscale, x, y } = size

      this.stage.obj.scaleX(1)
      this.stage.obj.scaleY(1)
      this.scale = 1

      this.group.obj.scaleX(Xscale)
      this.group.obj.scaleY(Yscale)

      this.stage.obj.offsetX(offsetWidth / 2)
      this.stage.obj.offsetY(offsetHeight / 2)
      this.stage.obj.x(offsetWidth / 2)
      this.stage.obj.y(offsetHeight / 2)

      layer.x(x)
      layer.y(y)

      this.stage.obj.rotate(degrees)
      this.stage.obj.draw()
    },

    // 重置图片
    resetImageSize(degrees = 0) {
      let { content } = this.$refs;
      let { offsetHeight, offsetWidth } = content;
      let { width: gWidth, height: gHeight } = this.group
      let { width, height } = this.image
      let x = 0, y = 0

      if (!(width < offsetWidth && height < offsetHeight)) {

        // if (offsetWidth / offsetHeight <= width / height) { // 横版
        if (1 <= width / height) { // 横版
          console.log('1')
          if (Math.abs(degrees) == 90 || Math.abs(degrees) == 270) {
            console.log('1-1')
            height = (offsetHeight * 0.8) * (height / width);
            width = offsetHeight * 0.8;   //以框的高度为标准
          } else {
            console.log('1-2')
            height = (offsetWidth * 0.8) * (height / width);
            width = (offsetWidth * 0.8);   //以框的宽度为标准
          }
        } else { // 竖版
          console.log('2')
          if (Math.abs(degrees) == 90 || Math.abs(degrees) == 270) {
            width = (offsetWidth * 0.8) * (width / height);
            height = (offsetWidth * 0.8);   //以框的宽度为标准
            console.log('2-1')
          } else {
            console.log('2-2')
            width = (offsetHeight * 0.8) * (width / height);
            height = offsetHeight * 0.8;   //以框的高度为标准
          }
        }

      }


      // 赋值 旋转后组的缩放比例
      let Xscale = this.group.Xscale = (width / gWidth) == 'Infinity' ? 1 : width / gWidth
      let Yscale = this.group.Yscale = (width / gWidth) == 'Infinity' ? 1 : width / gWidth


      this.layer.x = x = (offsetWidth - width) / 2
      this.layer.y = y = (offsetHeight - height) / 2

      console.log(Xscale, Yscale)

      return {
        Xscale,
        Yscale,
        width,
        height,
        x,
        y
      }
    },

    handleClip() {
      //   this.clipGroup = new Konva.Group({
      //     clip: {
      //       x: this.mouseFrom.x,
      //       y: this.mouseFrom.y,
      //       width: 400,
      //       height: 300
      //     },
      //     stroke: 'white',
      //     strokeWidth: 2,
      //     draggable: true,
      //   })

      //   this.clipGroup.add(this.theImg)

      //   this.layer.add(this.clipGroup)
      //   this.layer.add(this.clipGroup);
      //   this.stage.draw()
    },

    // mouseDown
    handleMouseDown(e) {
      let stagePoint = e.target.getStage().getPointerPosition()
      let layerPoint = e.target.getLayer().absolutePosition()

      // 若果是画圆 计算圆心

      if (this.clickCircle) {
        this.doDrawing = true
      }

      this.mousePosition.startPositionX = stagePoint.x
      this.mousePosition.startPositionY = stagePoint.y

      // 计算圆点
      this.countCircleCenter(stagePoint, layerPoint)
    },

    // mouseMove
    handleMouseMove(e) {
      let stagePoint = e.target.getStage().getPointerPosition()
      let { x, y } = stagePoint
      this.mousePosition.endPositionX = x;
      this.mousePosition.endPositionY = y;
      if (this.doDrawing) this.drawing()
    },

    // mouseUp
    handleMouseUp(e) {
      let stagePoint = e.target.getStage().getPointerPosition()
      let { x, y } = stagePoint
      this.mousePosition.endPositionX = x;
      this.mousePosition.endPositionY = y;
      this.clickCircle = false
      this.doDrawing = false
      this.controllStage(true)
    },

    // 缩放
    handleMouseZoom(evt) {
      let { x, y, obj: layer } = this.layer
      let { width: offsetWidth, height: offsetHeight, obj: stage } = this.stage

      let event = evt.evt;
      let scale = stage.scaleX();
      scale += event.deltaY * -0.01;
      scale = Math.min(Math.max(.8, scale), 3);
      this.mapToShapeScale(stage, scale);
      this.scale = scale

      layer.x(x)
      layer.y(y)

      stage.offsetX(offsetWidth / 2)
      stage.offsetY(offsetHeight / 2)

      stage.x(offsetWidth / 2);
      stage.y(offsetHeight / 2);

      stage.batchDraw();

    },

    // 缩放
    mapToShapeScale(shape, scale) {
      shape.scale({
        x: scale,
        y: scale,
      });
    },

    // 计算圆心位置
    countCircleCenter(stagePoint, layerPoint) {
      let { Xscale, Yscale } = this.group

      //   let cacheX = this.circlePosition.x = stagePoint.x - layerPoint.x
      //   let cacheY = this.circlePosition.y = stagePoint.y - layerPoint.y
      let cacheX = stagePoint.x - layerPoint.x
      let cacheY = stagePoint.y - layerPoint.y

      let rotation = this.stage.obj.rotation() % 360;

      if (rotation) {

        if (rotation % 180 === 0) {
          this.circlePosition.x = -cacheX / Xscale;
          this.circlePosition.y = -cacheY / Yscale;
        } else if (rotation % 270 === 0) {
          if (rotation > 0) {
            this.circlePosition.x = -cacheY / Xscale;
            this.circlePosition.y = cacheX / Yscale;
            return
          }

          this.circlePosition.x = cacheY / Xscale;
          this.circlePosition.y = -cacheX / Yscale;
        } else if (rotation % 90 === 0) {
          if (rotation > 0) {
            this.circlePosition.x = cacheY / Xscale;
            this.circlePosition.y = -cacheX / Yscale;
            return
          }
          this.circlePosition.x = -cacheY / Xscale;
          this.circlePosition.y = cacheX / Yscale;
        }
      }
      else {
        this.circlePosition.x = cacheX / Xscale
        this.circlePosition.y = cacheY / Yscale;
      }
      //   this.circlePosition.x = this.circlePosition.x 
      //   this.circlePosition.y = this.circlePosition.y 
    }
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
.container {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
}

.tools {
  width: 100%;
  height: 40px;
  line-height: 40px;
  background: rgb(202, 202, 202);
}
.content {
  width: 100%;
  height: calc(100vh - 40px);
  background: rgb(240, 240, 240);
}

#menu {
  position: absolute;
  display: none;
  background: rgb(196, 196, 196);
}

.box {
  display: flex;
  flex-direction: column;
}

#menu button {
  padding: 5px 10px;
}
</style>
