<template>
  <div class="layer">
    <div class="leftbar">
      <div class="modelattributes" v-if="modelNow">

        <div class="modelattributes-item">
          <span class="modelattributes-item-name">position:</span>

          <!--          {{modelNow.position}}-->
          <input class="modelattributes-item-input" v-model="x1" @keypress.enter="applyChange"/>
          <input class="modelattributes-item-input" v-model="y1" @keypress.enter="applyChange"/>
          <input class="modelattributes-item-input" v-model="z1" @keypress.enter="applyChange"/>
        </div>
        <div class="modelattributes-item">
          <span class="modelattributes-item-name">scale:</span>
          <!--          {{modelNow.scale}}-->
          <input class="modelattributes-item-input" v-model="x2" @keypress.enter="applyChange"/>
          <input class="modelattributes-item-input" v-model="y2" @keypress.enter="applyChange"/>
          <input class="modelattributes-item-input" v-model="z2" @keypress.enter="applyChange"/>
        </div>
        <div class="modelattributes-item">
          <span class="modelattributes-item-name">rotation:</span>
          <!--          {{modelNow.rotation}}-->
          <input class="modelattributes-item-input" v-model="x3" @keypress.enter="applyChange"/>
          <input class="modelattributes-item-input" v-model="y3" @keypress.enter="applyChange"/>
          <input class="modelattributes-item-input" v-model="z3" @keypress.enter="applyChange"/>

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
          <div class="modellisttype-icon" @click="visibleObj(i)">
            <a-icon v-if="!item.visible" type="eye-invisible" />
            <a-icon v-if="item.visible" type="eye" />
          </div>
          <div class="modellisttype-item" @click.stop="selectModelByListBtn(i)">
            {{ i + 1 }}:{{ item.geometry.type }}
          </div>
        </div>
      </div>
    </div>

    <div class="rightbar">
      <button @click="addObj('box')">addBox</button>
      <button @click="addObj('ball')">addBall</button>
      <button @click="addObj('cylinder')">addCylinder</button>
      <button @click="addObj('cone')">addCone</button>
      <button @click="addObj('torus')">addTorus</button>
      <button @click="addObj('plane')">addPlane</button>

      <div style="width:0;height:30px"></div>
      <button @click="subtractObj">subtract</button>
      <button @click="unionObj">union</button>
      <button @click="intersectObj">intersect</button>


    </div>

  </div>
</template>

<script>
import * as THREE from 'three';
// 鼠标控制视角变化
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
// import {DragControls} from 'three/examples/jsm/controls/DragControls.js';
const ThreeBSP = require('three-js-csg/index.js')(THREE);

export default {
  name: 'HelloWorld',
  data() {
    return {
      mouse: '',
      camera: '',
      scene: '',
      raycaster: '',
      INTERSECTED: '',
      selectedObjects: [],
      transformControl: null,
      isPick: true,
      x1: 0,
      y1: 0,
      z1: 0,
      x2: 0,
      y2: 0,
      z2: 0,
      x3: 0,
      y3: 0,
      z3: 0,
      x1_m: 0,
      y1_m: 0,
      x2_m: 0,
      y2_m: 0,
      msg: 'Welcome to Your Vue.js App',
      modelList: [],
      modelNow: {
        position: false
      }, // 选中的物体是哪个
      leftOpen: true,
      flageIsClick: false, // 鼠标是否被按下
      flagFocus: false,// 目前鼠标是否接触到物体
      focusNow: '', // 接触到的物体是哪个
      groupVue: [],
      outlinePass: '',
    }
  },
  watch: {
    isPick(val,oldVal){
      if(val){
        this.transformControl.visible = true;
      } else {
        this.transformControl.visible = false;
      }
    },
    // focusNow(val, oldVal){
    //     // console.log(val);
    // },
    // 物体变化时，重新显示位置
    modelNow: {
      handler(val, oldVal) {
        if(val.position !== false){
          this.transformControl.detach(oldVal);
          this.transformControl.attach(this.modelNow);
          console.log(val);
        }
      },
    },
    'modelNow.position': {
      handler(val, oldVal) {
        // this.transformControl.detach(oldVal);
        // this.transformControl.attach(this.modelNow);
        if(val !== false){
          this.x1 = this.modelNow.position.x;
          this.y1 = this.modelNow.position.y;
          this.z1 = this.modelNow.position.z;
          this.x2 = this.modelNow.scale.x;
          this.y2 = this.modelNow.scale.y;
          this.z2 = this.modelNow.scale.z;
          this.x3 = this.modelNow.rotation.x / Math.PI * 180;
          this.y3 = this.modelNow.rotation.y / Math.PI * 180;
          this.z3 = this.modelNow.rotation.z / Math.PI * 180;
        }
      },
      deep: true,
    },
  },
  created() {



    let _this = this;

    function onMouseDown(event) {
      _this.x1_m = event.clientX;
      _this.y1_m = event.clientY;
      document.body.style.cursor = 'move';
    }

    document.body.addEventListener('mousedown', onMouseDown);

    function onMouseUp(event) {
      _this.x2_m = event.clientX;
      _this.y2_m = event.clientY;
      document.body.style.cursor = 'default';
    }

    document.body.addEventListener('mouseup', onMouseUp)

    function pressObj(event) {
      // const p = document.createElement("p");
      // p.textContent = `KeyboardEvent: key='${event.key}' | code='${event.code}'`;
      if(event.key === 'Delete'){
        _this.deleteObj();
      }
    }

    document.body.addEventListener("keydown", pressObj, true);

  },
  mounted() {

    let container, stats;
    let scene, renderer;
    // let mouse;
    let mesh, line;
    let group, lineGroup;
    let geometry, material;
    // let _this.INTERSECTED;
    let composer,renderPass;

    // let flageIsClick = false;
    let _this = this;

    // this.groupVue = group;


    // 场景、相机
    scene = new THREE.Scene();
    _this.scene = scene;
    _this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({
      // 抗锯齿用的
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf5f5f5, 1);
    // canvas元素
    document.body.appendChild(renderer.domElement);


    // 相机视角控制
    const controls = new OrbitControls(_this.camera, renderer.domElement);


    // 光线投射鼠标拾取
    _this.raycaster = new THREE.Raycaster();
    _this.mouse = new THREE.Vector2();

    function onMouseMove2(event) {
      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +
      // alert('!!');

      _this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      _this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    }

    document.body.addEventListener('mousemove', onMouseMove2, false);


    // 物体group
    this.groupVue = new THREE.Group();

    // 立方体
    let x1 = -10, y1 = 0, z1 = 0;
    // for (let i = 0; i < 10; i++) {
    //     geometry = new THREE.BoxGeometry();
    //     material = new THREE.MeshLambertMaterial({
    //         color: 0xB0D3DA,
    //     });
    //     const wireframeMaterial = new THREE.MeshBasicMaterial({
    //         color: 0x000000,
    //         wireframe: true,
    //         transparent: true
    //     });
    //
    //     const object = new THREE.Mesh(geometry, material);
    //
    //     let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    //     object.add(wireframe);
    //
    //     x1 += 2;
    //     // y1 += 2;
    //     // z1 += 2;
    //     object.position.x = x1;
    //     object.position.y = y1;
    //     object.position.z = z1;
    //
    //     this.groupVue.add(object);
    // }


    const box = new THREE.Mesh(new THREE.BoxGeometry(5, 1,));
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20));

    const sBSP = new ThreeBSP(sphere);
    const bBSP = new ThreeBSP(box);


    const sub = bBSP.subtract(sBSP);

    const newMesh = sub.toMesh();
    this.groupVue.add(newMesh);
    console.log('sub');
    console.log(newMesh);

    // wireframe
    let geometryTmp = new THREE.BoxGeometry(10,10,10);
    geometryTmp.copy(newMesh.geometry);

    let wireframeMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true,
      transparent: true
    });
    let wireframe = new THREE.Mesh(geometryTmp, wireframeMaterial2);
    newMesh.add(wireframe);


    newMesh.material = new THREE.MeshLambertMaterial({
      color: 0xB0D3DA,
    });

    scene.add(this.groupVue); // 默认（0,0,0）坐标


    // 地面
    const helper = new THREE.GridHelper(10, 10, 0xBDBDBD, 0xBDBDBD);
    // helper.position.y = 0.1;
    scene.add(helper);
    // 坐标轴
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);


    // light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // TODO effectPass
    composer = new EffectComposer( renderer );
    this.outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, _this.camera , _this.selectedObjects );
    this.outlinePass.visibleEdgeColor.set( 'red' );
    this.outlinePass.hiddenEdgeColor.set( 'green' );

    composer.setPixelRatio( 1 ); // ensure pixel ratio is always 1 for performance reasons
    let ssaaRenderPassP = new SSAARenderPass( scene, _this.camera );
    ssaaRenderPassP.clearColor = 0xf5f5f5;
    ssaaRenderPassP.clearAlpha = 1.0;
    composer.addPass( ssaaRenderPassP );

    renderPass = new RenderPass( scene, _this.camera );
    composer.addPass( renderPass );
    composer.addPass( this.outlinePass );

    // let FXAAShaderPass = new ShaderPass(FXAAShader);
    // FXAAShaderPass.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    // composer.addPass(FXAAShaderPass);


    // let copyPass = new ShaderPass( CopyShader );
    // composer.addPass( copyPass );

    // const pass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );
    // composer.addPass( pass );

    console.log(composer);


    _this.camera.position.z = 5;


    console.log('scene');
    console.log(scene);

    this.modelList = scene.children[0].children;
    this.modelNow = this.modelList[0];

    // console.log('modelNow');
    // console.log(this.modelNow);

    // 绑定物体拖拽事件
    this.transformControl = new TransformControls(_this.camera, renderer.domElement);
    this.transformControl.attach(this.modelNow);
    // 防止拖动物体的时候视角跟着一起动
    this.transformControl.addEventListener('dragging-changed', function (event) {
      controls.enabled = !event.value;
    });
    scene.add(_this.transformControl);


    // TODO Animate loop
    function render() {
      // renderer.render(scene, camera);
      composer.render();
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    // TODO 鼠标点击选中物体
    function getObjNow() {
      _this.getObjNow2();
    }
    document.body.addEventListener('click', getObjNow);


    animate();

  },
  beforeDestroy() {
    // 删除canvas
    let res = document.getElementsByTagName('canvas');
    res[0].parentNode.removeChild(res[0]);


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
      this.modelNow.rotation.set(this.x3 * Math.PI / 180, this.y3 * Math.PI / 180, this.z3 * Math.PI / 180);
      // this.modelNow.rotation.x = this.x3;
      // this.modelNow.rotation.y = this.y3;
      // this.modelNow.rotation.z = this.z3;
    },
    addObj(a) {
      let geometry;
      switch (a) {
        case 'box': {
          geometry = new THREE.BoxGeometry();
          break;
        }
        case 'ball': {
          geometry = new THREE.SphereGeometry(1, 32, 32);
          break;
        }
        case 'cylinder': {
          geometry = new THREE.CylinderGeometry();
          break;
        }
        case 'cone': {
          geometry = new THREE.ConeGeometry();
          break;
        }
        case 'torus': {
          geometry = new THREE.TorusGeometry();
          break;
        }
        case 'plane': {
          geometry = new THREE.PlaneGeometry();
          break;
        }
        default: {

        }
      }

      let material = new THREE.MeshLambertMaterial({
        color: 0xB0D3DA,
      });
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true
      });

      let object = new THREE.Mesh(geometry, material);

      let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
      object.add(wireframe);

      object.position.x = 0;
      object.position.y = 0;
      object.position.z = 2;

      this.groupVue.add(object);
      this.selectModelByListBtn(this.modelList.length-1);

      console.log(this.groupVue);

    },
    visibleObj(index){
      if(this.modelList[index].visible){
        this.modelList[index].visible = false;
      } else {
        this.modelList[index].visible = true;
      }
    },
    subtractObj(){

      // removeEventListener()
      document.body.removeEventListener('click', getObjNow);
      let modelA = this.modelNow;

      let _this = this;
      document.body.addEventListener('click', function f() {
        let res = _this.getObjClick();
        if(res >= 0){
          let modelB = _this.modelList[res];

          const sBSP = new ThreeBSP(modelA);
          const bBSP = new ThreeBSP(modelB);

          const sub = sBSP.subtract(bBSP);

          const newMesh = sub.toMesh();
          _this.groupVue.add(newMesh);
          _this.modelList.push('');
          _this.modelList.pop();

          console.log('sub');
          console.log(newMesh);

          // wireframe
          let geometry = new THREE.BoxGeometry(10,10,10);
          geometry.copy(newMesh.geometry);

          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true
          });
          let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
          newMesh.add(wireframe);

          newMesh.material = new THREE.MeshLambertMaterial({
            color: 0xB0D3DA,
          });

          modelA.visible = false;
          modelB.visible = false;

          let num = _this.getNumByUuid(newMesh.uuid);
          console.log(_this.modelNow);
          _this.selectModelByListBtn(num);

          document.body.removeEventListener('click', f);
          document.body.addEventListener('click', getObjNow);
        }

      });


      function getObjNow() {

        _this.getObjNow2();

        // // 旋转视角的时候不会触发
        // // raycaster
        // let res = _this.getObjClick();
        //
        // // 命中
        // if(res >= 0){
        //   _this.isPick = true;
        //   // 调用选择方法
        //   _this.selectModelByListBtn(res);
        // }
        // // 没命中
        // else if(res === -1) {
        //   if(_this.isPick){
        //     _this.modelNow.material.color = new THREE.Color('white');
        //     // 改变左侧样式栏样式
        //     let num = _this.getNumByUuid(_this.modelNow.uuid);
        //     let modelList = document.getElementsByClassName("modellisttype-item");
        //     modelList[num].style.backgroundColor = 'white';
        //   }
        //   _this.isPick = false;
        // }
      }


    },
    unionObj(){
      // removeEventListener()
      document.body.removeEventListener('click', getObjNow);
      let modelA = this.modelNow;

      let _this = this;
      document.body.addEventListener('click', function f() {
        let res = _this.getObjClick();
        if(res >= 0){
          let modelB = _this.modelList[res];

          const sBSP = new ThreeBSP(modelA);
          const bBSP = new ThreeBSP(modelB);

          const sub = sBSP.union(bBSP);

          const newMesh = sub.toMesh();
          _this.groupVue.add(newMesh);

          console.log('sub');
          console.log(newMesh);

          // wireframe
          let geometry = new THREE.BoxGeometry(10,10,10);
          geometry.copy(newMesh.geometry);

          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true
          });
          let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
          newMesh.add(wireframe);

          newMesh.material = new THREE.MeshLambertMaterial({
            color: 0xB0D3DA,
          });

          modelA.visible = false;
          modelB.visible = false;

          let num = _this.getNumByUuid(newMesh.uuid);
          console.log(_this.modelNow);
          _this.selectModelByListBtn(num);

          document.body.removeEventListener('click', f);
          document.body.addEventListener('click', getObjNow);
        }

      });

      function getObjNow() {

        _this.getObjNow2();

        // // 旋转视角的时候不会触发
        // // raycaster
        // let res = _this.getObjClick();
        //
        // // 命中
        // if(res >= 0){
        //   _this.isPick = true;
        //   // 调用选择方法
        //   _this.selectModelByListBtn(res);
        // }
        // // 没命中
        // else if(res === -1) {
        //   if(_this.isPick){
        //     _this.modelNow.material.color = new THREE.Color('white');
        //     // 改变左侧样式栏样式
        //     let num = _this.getNumByUuid(_this.modelNow.uuid);
        //     let modelList = document.getElementsByClassName("modellisttype-item");
        //     modelList[num].style.backgroundColor = 'white';
        //   }
        //   _this.isPick = false;
        // }
      }
    },
    intersectObj(){
      // removeEventListener()
      document.body.removeEventListener('click', getObjNow);
      let modelA = this.modelNow;

      let _this = this;
      document.body.addEventListener('click', function f() {
        let res = _this.getObjClick();
        if(res >= 0){
          let modelB = _this.modelList[res];

          const sBSP = new ThreeBSP(modelA);
          const bBSP = new ThreeBSP(modelB);

          const sub = sBSP.intersect(bBSP);

          const newMesh = sub.toMesh();
          _this.groupVue.add(newMesh);

          console.log('sub');
          console.log(newMesh);

          // wireframe
          let geometry = new THREE.BoxGeometry(10,10,10);
          geometry.copy(newMesh.geometry);

          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true
          });
          let wireframe = new THREE.Mesh(geometry, wireframeMaterial);
          newMesh.add(wireframe);

          newMesh.material = new THREE.MeshLambertMaterial({
            color: 0xB0D3DA,
          });

          modelA.visible = false;
          modelB.visible = false;

          let num = _this.getNumByUuid(newMesh.uuid);
          console.log(_this.modelNow);
          _this.selectModelByListBtn(num);

          document.body.removeEventListener('click', f);
          document.body.addEventListener('click', getObjNow);
        }

      });

      function getObjNow() {

        _this.getObjNow2();

        // // 旋转视角的时候不会触发
        // // raycaster
        // let res = _this.getObjClick();
        //
        // // 命中
        // if(res >= 0){
        //   _this.isPick = true;
        //   // 调用选择方法
        //   _this.selectModelByListBtn(res);
        // }
        // // 没命中
        // else if(res === -1) {
        //   if(_this.isPick){
        //     _this.modelNow.material.color = new THREE.Color('white');
        //     // 改变左侧样式栏样式
        //     let num = _this.getNumByUuid(_this.modelNow.uuid);
        //     let modelList = document.getElementsByClassName("modellisttype-item");
        //     modelList[num].style.backgroundColor = 'white';
        //   }
        //   _this.isPick = false;
        // }
      }
    },
    selectModelByListBtn(index) {

      // alert(index);
      // 上一个
      // console.log('modelListDOM');
      // console.log(this.modelList);
      // console.log(this.groupVue);
      this.$nextTick(() => {
        console.log(this.modelNow.uuid);
        let lastIndex = this.getNumByUuid(this.modelNow.uuid);
        let modelListDOM = document.getElementsByClassName("modellisttype-item");
        console.log(modelListDOM);

        // alert(lastIndex);

        modelListDOM[lastIndex].style.backgroundColor = 'white';
        modelListDOM[index].style.backgroundColor = 'darkgrey';

        this.modelNow.material.color = new THREE.Color('white');
        this.modelList[index].material.color = new THREE.Color('black');

        this.modelNow = this.modelList[index];

        this.selectedObjects = [];
        this.selectedObjects.push(this.modelNow);
        this.outlinePass.selectedObjects = this.selectedObjects;

      })

      // console.log(this.outlinePass);
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
    },
    deleteObj(){
      let _this = this;
      let objTmp = _this.modelNow;
      if(_this.modelList.length > 1){
        _this.groupVue.remove(objTmp);
        _this.modelNow = _this.modelList[0];
      }
      else{
        this.transformControl.detach(_this.modelNow);
        _this.modelNow = {
          position: false
        }; // 选中的物体是哪个
        _this.groupVue.remove(objTmp);
      }
    },
    getObjNow2(){
      // 旋转视角的时候不会触发
      // raycaster
      let _this = this;
      let res = _this.getObjClick();
      // 命中
      if(res >= 0){
        _this.isPick = true;
        // 调用选择方法
        _this.selectModelByListBtn(res);
      }
      // 没命中
      else if(res === -1) {
        if(_this.isPick){
          _this.modelNow.material.color = new THREE.Color('white');
          // 改变左侧样式栏样式
          let num = _this.getNumByUuid(_this.modelNow.uuid);
          let modelList = document.getElementsByClassName("modellisttype-item");
          modelList[num].style.backgroundColor = 'white';
        }
        _this.isPick = false;
      }
    },
    // 命中返回num，没命中返回-1，在视角旋转返回-2
    getObjClick(){
      // 旋转视角的时候不会触发
      // raycaster
      let _this = this;
      let tmp1 = _this.x2_m - _this.x1_m;
      let tmp2 = _this.y2_m - _this.y1_m;
      // alert('tmp1:'+ tmp1+'; tmp2:'+tmp2);
      if(tmp1 > -2 && tmp1 < 2 && tmp2 > -2 && tmp2 < 2){
        _this.flageIsClick = true;
      }else{
        _this.flageIsClick = false;
      }

      if (_this.flageIsClick) {
        // 通过摄像机和鼠标位置更新射线
        _this.raycaster.setFromCamera(_this.mouse, _this.camera);

        // 计算物体和射线的焦点
        const intersects = _this.raycaster.intersectObjects(_this.scene.children, true);
        console.log(intersects)
        // 排除掉辅助网格
        if (intersects.length > 0) {
          let tmp = 0;
          while (intersects.length > 0 && tmp < intersects.length) {
            // ??
            // console.log(intersects[tmp].object);
            if (intersects[tmp].object.name !== "" && intersects[tmp].object.type === 'Mesh') {
              tmp++;
              _this.flagFocus = false;
            } else if (intersects[tmp].object.type === 'GridHelper') {
              tmp++;
              _this.flagFocus = false;
            } else if (intersects[tmp].object.type === 'AxesHelper') {
              tmp++;
              _this.flagFocus = false;
            } else if (intersects[tmp].object.type === 'Line') {
              tmp++;
              _this.flagFocus = false;
            } else if (intersects[tmp].object.type === 'TransformControlsPlane') {
              tmp++;
              _this.flagFocus = false;
              // 跳过不可见的
            } else if (intersects[tmp].object.visible === false) {
              tmp++;
              _this.flagFocus = false;
              // 跳过网格
            } else if (intersects[tmp].object.material.wireframe === true) {
              tmp++;
              _this.flagFocus = false;
            } else {
              // console.log(intersects[tmp].object.name);
              if (_this.INTERSECTED != intersects[tmp].object) {
                if (_this.INTERSECTED) {
                  // 上一个命中物体的材质
                  // _this.INTERSECTED.material.colorWrite = true;
                  // _this.INTERSECTED.material.color = new THREE.Color('white');
                }
                _this.INTERSECTED = intersects[tmp].object;
                _this.focusNow = intersects[tmp].object;
                // intersects[tmp].object.material.color = new THREE.Color('black');

                document.body.style.cursor = 'pointer';
              }
              // console.log(_this.INTERSECTED);
              _this.flagFocus = true;

              break;
            }
          }
          // 如果全都是辅助网格
          if (_this.flagFocus === false && tmp === intersects.length && _this.INTERSECTED) {
            // _this.INTERSECTED.material.colorWrite = true;
            // _this.INTERSECTED.material.color = new THREE.Color('white');
            _this.INTERSECTED = null;
            _this.focusNow = null;
            document.body.style.cursor = '';
            _this.flagFocus = false;
          }
        } else { //没有命中对象
          if (_this.INTERSECTED) {
            // _this.INTERSECTED.material.color = new THREE.Color('white');
            // _this.INTERSECTED.material.colorWrite = true;
          }
          _this.INTERSECTED = null;
          _this.focusNow = null;
          document.body.style.cursor = '';
          _this.flagFocus = false;
        }

        if(_this.flagFocus){
          // 上一个
          // console.log('modelNow2');
          // console.log(_this.modelNow);
          // 这一个
          let num = _this.getNumByUuid(_this.focusNow.uuid);
          // 调用选择方法
          return num;

        }
        // 没命中
        else {
          return -1;
        }

      }
      return -2;
    },
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
  outline: none;
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
  /*background-color: #C0DBF0;*/
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

.modelattributes-item-name {
  width: 75px;
  line-height: 25px;
  align-items: center;
  text-align: left;
}

</style>
