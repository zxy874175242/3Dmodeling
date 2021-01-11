<template>
  <div class="layer">
    <div class="leftbar">
      <div class="modelattributes">
<!--        <div class="modelattributes-title">-->
<!--          type:{{modelNow.type}}-->
<!--        </div>-->
        <div class="modelattributes-item">
          <span class="modelattributes-item-name">position:</span>

<!--          {{modelNow.position}}-->
          <input class="modelattributes-item-input" v-model="x1" @keypress.enter="applyChange"/>
          <input class="modelattributes-item-input" v-model="y1" @keypress.enter="applyChange" />
          <input class="modelattributes-item-input" v-model="z1" @keypress.enter="applyChange" />
        </div>
        <div class="modelattributes-item">
          <span class="modelattributes-item-name">scale:</span>
<!--          {{modelNow.scale}}-->
          <input class="modelattributes-item-input" v-model="x2" @keypress.enter="applyChange" />
          <input class="modelattributes-item-input" v-model="y2" @keypress.enter="applyChange" />
          <input class="modelattributes-item-input" v-model="z2" @keypress.enter="applyChange" />
        </div>
        <div class="modelattributes-item">
          <span class="modelattributes-item-name">rotation:</span>
<!--          {{modelNow.rotation}}-->
          <input class="modelattributes-item-input" v-model="x3" @keypress.enter="applyChange" />
          <input class="modelattributes-item-input" v-model="y3" @keypress.enter="applyChange" />
          <input class="modelattributes-item-input" v-model="z3" @keypress.enter="applyChange" />

        </div>
        <button class="modelattributes-item" @click="applyChange">应用</button>
      </div>
      <div style="margin:15px 20px;font-size: 20px;text-align: left">模型列表</div>
      <div @click="leftclose" style="text-align: right;margin-top: -25px;margin-right: 15px;cursor: pointer"
           id="leftswitch">'<<'
      </div>
      <div v-for="(item,i) in modelList" :key="item.message">
<!--        <i>??</i>-->
        <div class="modellisttype">
          <div class="modellisttype-icon">
            ??
          </div>
          <div class="modellisttype-item" @click="selectModelByList(i)">
            {{i+1}}:{{item.type}}
          </div>
        </div>
      </div>
    </div>

    <div class="rightbar">
      <button @click="addObj">add</button>
    </div>

  </div>
</template>

<script>
    // 鼠标控制视角变化
    import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

    export default {
        name: 'HelloWorld',
        data() {
            return {
                indexNow: 0,
                x1: 0,
                y1: 0,
                z1: 0,
                x2: 0,
                y2: 0,
                z2: 0,
                x3: 0,
                y3: 0,
                z3: 0,
                msg: 'Welcome to Your Vue.js App',
                modelList: [],
                modelNow: '', // 选中的物体是哪个
                leftOpen: true,
                flagMouseDown: false, // 鼠标是否被按下
                flagFocus: false,// 目前鼠标是否接触到物体
                focusNow: '', // 接触到的物体是哪个
                groupVue: [],
            }
        },
        watch: {
            // focusNow(val, oldVal){
            //     // console.log(val);
            // },
            modelNow(val, oldVal){
                console.log(val);
                this.x1 = this.modelNow.position.x;
                this.y1 = this.modelNow.position.y;
                this.z1 = this.modelNow.position.z;
                this.x2 = this.modelNow.scale.x;
                this.y2 = this.modelNow.scale.y;
                this.z2 = this.modelNow.scale.z;
                this.x3 = this.modelNow.rotation.x / Math.PI * 180;
                this.y3 = this.modelNow.rotation.y / Math.PI * 180;
                this.z3 = this.modelNow.rotation.z / Math.PI * 180;
            },
        },
        created() {
            let _this = this;

            function onMouseDown(event) {
                _this.flagMouseDown = true;
            }

            document.body.addEventListener('mousedown', onMouseDown);

            function onMouseUp(event) {
                _this.flagMouseDown = false;
            }

            document.body.addEventListener('mouseup', onMouseUp);

            function onClickGetModel(event) {
                if (_this.flagFocus === true) {
                    // _this.modelNow = _this.focusNow;
                    let num = _this.getNumByUuid(_this.focusNow.uuid);
                    // console.log(num);
                    if (num !== -1) {
                        _this.modelNow.material.colorWrite = true;
                        _this.modelNow = _this.modelList[num];
                        _this.modelNow.material.colorWrite = false;

                    }
                }
            }

            document.body.addEventListener('click', onClickGetModel);
        },
        mounted() {


            let container, stats;
            let camera, scene, renderer;
            let raycaster, mouse;
            let mesh, line;
            let group, lineGroup;
            let geometry, material;
            let INTERSECTED;
            // let flagMouseDown = false;
            let _this = this;

            // this.groupVue = group;

            // 场景、相机
            scene = new this.$THREE.Scene();
            camera = new this.$THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

            renderer = new this.$THREE.WebGLRenderer({
                // 抗锯齿用的
                antialias: true,
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xf5f5f5, 1);
            // canvas元素
            document.body.appendChild(renderer.domElement);


            // 相机视角控制
            const controls = new OrbitControls(camera, renderer.domElement);


            // 光线投射鼠标拾取
            raycaster = new this.$THREE.Raycaster();
            mouse = new this.$THREE.Vector2();

            function onMouseMove2(event) {
                // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +
                // alert('!!');

                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            }

            document.body.addEventListener('mousemove', onMouseMove2, false);


            // 物体group
            this.groupVue = new this.$THREE.Group();


            // 立方体
            let x1 = -10, y1 = 0, z1 = 0;
            for (let i = 0; i < 10; i++) {
                geometry = new this.$THREE.BoxGeometry();
                material = new this.$THREE.MeshLambertMaterial({
                    color: 0xB0D3DA,
                });
                const wireframeMaterial = new this.$THREE.MeshBasicMaterial({
                    color: 0x000000,
                    wireframe: true,
                    transparent: true
                });

                const object = new this.$THREE.Mesh(geometry, material);

                let wireframe = new this.$THREE.Mesh(geometry, wireframeMaterial);
                object.add(wireframe);

                x1 += 2;
                // y1 += 2;
                // z1 += 2;
                object.position.x = x1;
                object.position.y = y1;
                object.position.z = z1;


                //
                // object.rotation.x = Math.random() * 2 * Math.PI;
                // object.rotation.y = Math.random() * 2 * Math.PI;
                // object.rotation.z = Math.random() * 2 * Math.PI;
                //
                // object.scale.x = Math.random() + 0.5;
                // object.scale.y = Math.random() + 0.5;
                // object.scale.z = Math.random() + 0.5;

                this.groupVue.add(object);
            }


            scene.add(this.groupVue); // 默认（0,0,0）坐标


            // 地面
            const helper = new this.$THREE.GridHelper(10, 10, 0x444444, 0x444444);
            // helper.position.y = 0.1;
            scene.add(helper);
            // 坐标轴
            const axesHelper = new this.$THREE.AxesHelper(5);
            scene.add(axesHelper);


            // light
            const light = new this.$THREE.DirectionalLight(0xffffff, 1);
            light.position.set(1, 1, 1).normalize();
            scene.add(light);

            camera.position.z = 5;


            this.modelList = scene.children[0].children;
            // console.log(this.modelList);
            this.modelNow = this.modelList[0];


            // Animate loop
            function render() {
                // console.log(flagMouseDown);

                // 旋转视角的时候不会触发
                if (!_this.flagMouseDown) {
                    // 通过摄像机和鼠标位置更新射线
                    raycaster.setFromCamera(mouse, camera);

                    // 计算物体和射线的焦点
                    const intersects = raycaster.intersectObjects(scene.children, true);
                    // console.log(intersects)
                    // 排除掉辅助网格
                    if (intersects.length > 0) {
                        let tmp = 0;
                        while (intersects.length > 0 && tmp < intersects.length) {
                            if (intersects[tmp].object.type === 'GridHelper') {
                                tmp++;
                                _this.flagFocus = false;
                            } else if (intersects[tmp].object.type === 'AxesHelper') {
                                tmp++;
                                _this.flagFocus = false;
                            } else {
                                if (INTERSECTED != intersects[tmp].object) {
                                    if (INTERSECTED) {
                                        // 上一个命中物体的材质
                                        INTERSECTED.material.colorWrite = true;
                                    }
                                    INTERSECTED = intersects[tmp].object;
                                    _this.focusNow = intersects[tmp].object;
                                    intersects[tmp].object.material.colorWrite = false;

                                    document.body.style.cursor = 'pointer';
                                }
                                // console.log(INTERSECTED);
                                _this.flagFocus = true;

                                break;
                            }
                        }
                        // 如果全都是辅助网格
                        if (_this.flagFocus === false && tmp === intersects.length && INTERSECTED) {
                            INTERSECTED.material.colorWrite = true;
                            INTERSECTED = null;
                            _this.focusNow = null;
                            document.body.style.cursor = '';
                            _this.flagFocus = false;
                        }
                    } else { //没有命中对象
                        if (INTERSECTED) INTERSECTED.material.colorWrite = true;
                        INTERSECTED = null;
                        _this.focusNow = null;
                        document.body.style.cursor = '';
                    }
                }


                renderer.render(scene, camera);
            }

            function animate() {

                requestAnimationFrame(animate);
                render();
            }

            animate();

        },
        methods: {
            applyChange() {
                console.log(this.modelNow);

                this.modelNow.position.x = this.x1;
                this.modelNow.position.y = this.y1;
                this.modelNow.position.z = this.z1;
                this.modelNow.scale.x = this.x2;
                this.modelNow.scale.y = this.y2;
                this.modelNow.scale.z = this.z2;
                // 单位是PI
                this.modelNow.rotation.set(this.x3 * Math.PI / 180,this.y3 * Math.PI / 180,this.z3 * Math.PI / 180);
                // this.modelNow.rotation.x = this.x3;
                // this.modelNow.rotation.y = this.y3;
                // this.modelNow.rotation.z = this.z3;
            },
            addObj() {
                let geometry = new this.$THREE.BoxGeometry();
                let material = new this.$THREE.MeshLambertMaterial({
                    color: 0xB0D3DA,
                });
                const wireframeMaterial = new this.$THREE.MeshBasicMaterial({
                    color: 0x000000,
                    wireframe: true,
                    transparent: true
                });

                let object = new this.$THREE.Mesh(geometry, material);

                let wireframe = new this.$THREE.Mesh(geometry, wireframeMaterial);
                object.add(wireframe);

                object.position.x = 0;
                object.position.y = 0;
                object.position.z = 2;

                this.groupVue.add(object);

                console.log(this.groupVue)

            },
            selectModelByList(index) {
                let lastIndex = this.indexNow;
                let modelList = document.getElementsByClassName("modellisttype-item");

                modelList[lastIndex].style.backgroundColor = 'white';
                modelList[index].style.backgroundColor = 'darkgrey';

                this.modelNow.material.colorWrite = true;
                this.modelList[index].material.colorWrite = false;
                this.modelNow = this.modelList[index];
                this.indexNow = index;
            },
            leftclose() {
                if (this.leftOpen === false) {
                    document.getElementsByClassName("leftbar")[0].style.marginLeft = '0';
                    // document.getElementsByClassName("leftbar")[0].innerText = '>>';
                    document.querySelector("#leftswitch").innerText = '<<';

                } else {
                    document.getElementsByClassName("leftbar")[0].style.marginLeft = '-250px'
                    // document.getElementsByClassName("leftbar")[0].innerText = '<<';
                    document.querySelector("#leftswitch").innerText = '>>';
                }
                this.leftOpen = !this.leftOpen;
            },
            rightclose() {

            },
            getNumByUuid(uuid) {
                let res = -1;
                // console.log(uuid);
                // console.log(this.modelList);
                this.modelList.forEach((e, index) => {
                    if (e.uuid === uuid) {
                        res = index;
                    }
                })
                return res;
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .hello {
    background-color: #f5f5f5;
  }

  input {
    border-width: 0;
    /*background-color:transparent;*/
    outline:none;
  }

  .rightbar {
    position: fixed;
    width: 400px;
    height: 100vh;
    right: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.5);
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.04);
  }

  .modellisttype {
    height: 25px;
    margin-top: 10px;
    margin-left: 15px;
    text-align: left;
    line-height: 25px;
    align-items: center;
    display: flex;
    flex-direction: revert;
    /*background-color: rgba(0,0,0,0.1);*/

  }

  .modellisttype-icon {
    flex: 0 0 30px;
  }

  .modellisttype-item {
    box-sizing: border-box;
    padding-left: 8px;
    flex: 1;
  }


  .modellisttype-item:hover {
    cursor: pointer;
    background-color: whitesmoke;
  }

  .leftbar {
    position: fixed;
    width: 300px;
    height: 100vh;
    left: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.8);
    transition: margin-left 0.8s ease;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.04);

  }

  .modelattributes {
    position: absolute;
    width: 300px;
    /*height: 300px;*/
    margin-left: 320px;
    margin-top: 20px;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.04);
    padding: 20px 30px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }
  .modelattributes-title {
    font-size: 18px;
    margin: 10px 0px;

  }
  .modelattributes-item {
    margin: 5px 0px;
    display: flex;
    flex-direction: revert;
    justify-content: center;
    align-items: flex-start;
  }
  .modelattributes-item-input {
    margin: 0px 3px;
    width: 30px;
    line-height: 25px;
    border-radius: 3px;
    border: darkgrey 1px solid;
    box-sizing: border-box;
    text-align: center;
    /*padding: 0px 5px 0px 8px;*/
  }
  .modelattributes-item-input:hover {
    border: #535353 1px solid;
  }
  .modelattributes-item-input:focus {
    border: #16426e 1px solid;
  }
  .modelattributes-item-name{
    width: 75px;
    line-height: 25px;
    align-items: center;
    text-align: left;
  }
</style>
