<template>
  <div class="layer">
    <div class="leftbar">
      <div class="modelattributes">
        <div>type:{{modelNow.type}}</div>
        <div>position:{{modelNow.position}}</div>
        <div>scale:{{modelNow.scale}}</div>
        <div>rotation:{{modelNow.rotation}}</div>
      </div>
      <div style="margin:15px 20px;font-size: 20px;text-align: left">模型列表 </div>
      <div @click="leftclose" style="text-align: right;margin-top: -25px;margin-right: 15px" id="leftswitch">'<<'</div>
      <div v-for="(item,i) in modelList" :key="item.message">
        <div class="modellisttype" @click="selectModelByList(i)">
          {{i+1}}:{{item.type}}
        </div>
      </div>
    </div>

    <div class="rightbar">
    </div>

  </div>
</template>

<script>
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'HelloWorld',
  data () {
    return {
        msg: 'Welcome to Your Vue.js App',
        modelList: [],
        modelNow:'',
        leftOpen: true,
        flagMouseDown: false,
        flagFocus: false,
        focusNow: '',
    }
  },
    created(){
        let _this = this;
        function onMouseDown( event ){
            _this.flagMouseDown = true;
        }
        document.body.addEventListener( 'mousedown', onMouseDown);

        function onMouseUp( event ){
            _this.flagMouseDown = false;
        }
        document.body.addEventListener( 'mouseup', onMouseUp);

        function onClickGetModel( event ){
            if(_this.flagFocus === true){
                // _this.modelNow = _this.focusNow;
                let num = _this.getNumByUuid(_this.focusNow.uuid);
                // console.log(num);
                if(num !== -1 ){
                    _this.modelNow = _this.modelList[num];
                }
            }
        }
        document.body.addEventListener( 'click', onClickGetModel);
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
        var _this = this;

        // 场景、相机
        scene = new this.$THREE.Scene();
        camera = new this.$THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );

        renderer = new this.$THREE.WebGLRenderer({
          // 抗锯齿用的
          antialias:true,
        });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor(0xf5f5f5, 1);
        // canvas元素
        document.body.appendChild( renderer.domElement );



        // 相机视角控制
        const controls = new OrbitControls(camera, renderer.domElement);



        // 光线投射鼠标拾取
        raycaster = new this.$THREE.Raycaster();
        mouse = new this.$THREE.Vector2();

        function onMouseMove2( event ) {
            // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +
            // alert('!!');

            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        }
        document.body.addEventListener( 'mousemove', onMouseMove2, false );





        // 物体group
        group = new this.$THREE.Group();



        // 立方体
        let x1 = -10,y1 = 0,z1 = 0;
        for(let i = 0;i < 10;i++){
            geometry = new this.$THREE.BoxGeometry();
            material = new this.$THREE.MeshLambertMaterial( {
                color: Math.random() * 0xffffff ,
            } );
            const wireframeMaterial = new this.$THREE.MeshBasicMaterial( {
                color: 0x000000,
                wireframe: true,
                transparent: true
            } );

            const object = new this.$THREE.Mesh( geometry, material );

            let wireframe = new this.$THREE.Mesh( geometry, wireframeMaterial );
            object.add( wireframe );

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

            group.add( object );
        }


        scene.add( group ); // 默认（0,0,0）坐标


        // 地面
        const helper = new this.$THREE.GridHelper( 10, 10, 0x444444, 0x444444 );
        // helper.position.y = 0.1;
        scene.add( helper );
        // 坐标轴
        const axesHelper = new this.$THREE.AxesHelper( 5 );
        scene.add( axesHelper );



        // light
        const light = new this.$THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( 1, 1, 1 ).normalize();
        scene.add( light );

        camera.position.z = 5;


        this.modelList = scene.children[0].children;
        // console.log(this.modelList);
        this.modelNow = this.modelList[0];


        // Animate loop
        function render() {
            // console.log(flagMouseDown);

            // 旋转视角的时候不会触发
            if(!_this.flagMouseDown){
                // 通过摄像机和鼠标位置更新射线
                raycaster.setFromCamera( mouse, camera );

                // 计算物体和射线的焦点
                const intersects = raycaster.intersectObjects( scene.children , true);
                // console.log(intersects)
                if ( intersects.length > 0 ) {

                    let tmp = 0;

                    while( intersects.length > 0 && tmp < intersects.length){
                        if(intersects[ tmp ].object.type === 'GridHelper'){
                            tmp++;
                            _this.flagFocus = false;
                        }
                        else if(intersects[ tmp ].object.type === 'AxesHelper'){
                            tmp++;
                            _this.flagFocus = false;
                        }
                        else{
                            if (INTERSECTED != intersects[ tmp ].object) {
                                if ( INTERSECTED ) {
                                    INTERSECTED.material.colorWrite = true ;
                                }
                                INTERSECTED = intersects[ tmp ].object;
                                _this.focusNow = intersects[ tmp ].object;
                                intersects[ tmp ].object.material.colorWrite = false ;

                                document.body.style.cursor = 'pointer';
                            }
                            // console.log(INTERSECTED);
                            _this.flagFocus = true;

                            break;
                        }
                    }
                    // 如果全都是辅助网格
                    if(_this.flagFocus === false && tmp === intersects.length && INTERSECTED){
                        INTERSECTED.material.colorWrite = true ;
                        INTERSECTED = null;
                        _this.focusNow = null;
                        document.body.style.cursor = '';
                        _this.flagFocus = false;
                    }


                } else {
                    if ( INTERSECTED ) INTERSECTED.material.colorWrite = true ;
                    INTERSECTED = null;
                    _this.focusNow = null;
                    document.body.style.cursor = '';
                }
            }


            renderer.render( scene, camera );
        }


        function animate() {

            requestAnimationFrame( animate );
            render();
        }
        animate();

    },
    methods: {
        selectModelByList(index) {
            this.modelList[index].material.colorWrite = !this.modelList[index].material.colorWrite ;
            this.modelNow = this.modelList[index];
        },
        leftclose() {
            if(this.leftOpen === false){
                document.getElementsByClassName("leftbar")[0].style.marginLeft = '0';
                // document.getElementsByClassName("leftbar")[0].innerText = '>>';
                document.querySelector("#leftswitch").innerText = '<<';

            }
            else{
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
            this.modelList.forEach((e,index) => {
                if(e.uuid === uuid){
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
  .rightbar {
    position: fixed;
    width: 400px;
    height: 100vh;
    right: 0;
    top: 0;
    background-color: white;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.04);
  }
  .modellisttype{
    height: 25px;
    margin-top: 10px;
    margin-left: 15px;
    text-align: left;
    line-height: 25px;
    align-items: center;
    /*background-color: rgba(0,0,0,0.1);*/

  }
  .modellisttype:hover {
    cursor: pointer;
    background-color: whitesmoke;
  }
  .leftbar {
    position: fixed;
    width: 300px;
    height: 100vh;
    left: 0;
    top: 0;
    background-color: white;
    transition: margin-left 0.8s ease;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.04);

  }
  .modelattributes {
    position: absolute;
    width: 300px;
    /*height: 300px;*/
    margin-left: 320px;
    margin-top: 20px;
    background-color: white;
    box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.04);
    padding: 20px 30px;
    box-sizing: border-box;

  }
</style>
