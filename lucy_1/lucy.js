const albedo_suffix = Filament.getSupportedFormatSuffix('astc s3tc');
const texture_suffix = Filament.getSupportedFormatSuffix('etc');
if (document.getElementById('pillar').checked )
{
	var environ = document.getElementById('pillar').value;
}
else if (document.getElementById('road').checked )
{
	var environ = document.getElementById('road').value;
}
else var environ = 'studio_small_02_2k';
const ibl_url = `${environ}/${environ}_ibl.ktx`;
const sky_small_url = `${environ}/${environ}_skybox.ktx`;
const sky_large_url = `${environ}/${environ}_skybox.ktx`;
const filamat_url = 'aiDefaultMat.filamat';
const filamesh_url = 'lucy.filamesh';
var x = 0;
 var red_1 = [0.8, 0.5, 0.3];
//var input = parseFloat(document.getElementById("input_1").value);

Filament.init([filamat_url, filamesh_url, sky_large_url, ibl_url], () => {
  window.Fov = Filament.Camera$Fov;
  window.LightType = Filament.LightManager$Type;	
  window.app = new App(document.getElementsByTagName("canvas")[0], (document.getElementById("red").value), (document.getElementById("green").value), (document.getElementById("blue").value), document.getElementById("metal").value, document.getElementById("rough").value, document.getElementById("reflect").value);
  });

class App {
  constructor(canvas, red_, green_, blue_, metal_, rough_, reflect_) {
    this.canvas = canvas;
    const engine = this.engine = Filament.Engine.create(canvas);
    const scene = this.scene = engine.createScene();
    const material = engine.createMaterial(filamat_url);
    const matinstance = material.createInstance();
    const filamesh = this.engine.loadFilamesh(filamesh_url, matinstance);
    this.suzanne = filamesh.renderable;
    if (red_ != "" && green_ != "" && blue_ != "")
      	{
      	red_1 = [parseFloat(red_)/256, parseFloat(green_)/256, parseFloat(blue_)/256];
      	console.log ("R " + red_ + " G " + green_ + " B "+ blue_);
      	}
  else
  {
  	console.log ("R " + red_ + " G " + green_ + " B "+ blue_);  
  	red_1 = [0.8, 0.5, 0.3];
  	}
  matinstance.setColor3Parameter('baseColor', Filament.RgbType.sRGB, red_1);
    if (metal_ != "")
    matinstance.setFloatParameter('metallic', parseFloat(metal_));
    else
    matinstance.setFloatParameter('metallic', 1.0);
    if (rough_ != "") 
    matinstance.setFloatParameter('roughness', parseFloat(rough_));
    else
    matinstance.setFloatParameter('roughness', .5);
    if (reflect_ != "")
    matinstance.setFloatParameter('reflectance', parseFloat(reflect_));
    else
    matinstance.setFloatParameter('reflectance', .7);
    const renderable = Filament.EntityManager.get()
      .create();
    scene.addEntity(renderable);
    Filament.RenderableManager.Builder(1)
      .boundingBox({
        center: [-1, -1, -1],
        halfExtent: [1, 1, 1]
      })
      .material(0, matinstance)
      .build(engine, renderable);
    const sunlight = Filament.EntityManager.get()
      .create();
    scene.addEntity(sunlight);
    Filament.LightManager.Builder(LightType.SUN)
      .color([0.98, 0.92, 0.89])
      .intensity(11000.0)
      .direction([0.6, -1.0, -0.8])
      .sunAngularRadius(1.9)
      .sunHaloSize(10.0)
      .sunHaloFalloff(80.0)
      .build(engine, sunlight);
    const backlight = Filament.EntityManager.get()
      .create();
    scene.addEntity(backlight);
    Filament.LightManager.Builder(LightType.DIRECTIONAL)
      .color([0.98, 0.92, 0.89])
      .direction([-1, 0, 1])
      .intensity(50000.0)
      .build(engine, backlight);
    const indirectLight = engine.createIblFromKtx(ibl_url);
    indirectLight.setIntensity(50000);
    scene.setIndirectLight(indirectLight);
    
    this.trackball = new Trackball(canvas, {
    homeTilt: .0,
    startSpin: 200,
    Resting: 0,
    Coasting: 1,
    DraggingInit:20,
    DraggingSpin:3,
    epsilon:3,
    radiansPerPixel:[0.03,0.03],
    allowSpin:1
              });
      //this.trackball = new Trackball(canvas);
   Filament.fetch([sky_large_url],
    () => {
    
    
    const skybox = engine.createSkyFromKtx(sky_large_url);
    scene.setSkybox(skybox);
    this.scene.addEntity(this.suzanne);
      });
    this.swapChain = engine.createSwapChain();
    this.renderer = engine.createRenderer();
    this.camera = engine.createCamera(Filament.EntityManager.get().create());
    this.view = engine.createView();
    this.view.setCamera(this.camera);
    this.view.setScene(scene);
    this.resize();
    this.render = this.render.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    window.requestAnimationFrame(this.render);
  }
  render() {
    const transform = this.trackball.getMatrix();
    //console.log("Trans: " + transform);
    const tcm = this.engine.getTransformManager();
    //const inst = tcm.getInstance(this.suzanne);
   // tcm.setTransform(inst, transform);
    //inst.delete();
    const radians = Date.now() / 10000;
 	var eye = [3, 1, 10];
     var center = [0, 1, 0];
     var up = [0, 1, 0];

	const radians2 = (Date.now() - this.start) / 3000;
	
	//x = x + 0.0001;
	//console.log("x =" + x); 
	//const out = mat4.set(mat4.create(), 1, 1, 1, 1, 1, 1, 1, 1, x, 1, 1, 1, 1, 1, 1, 1);
	//console.log("Out " + out);
	//console.log("Create " + mat4.create());
	//const timer = (Date.now() - this.start)/1000;
	
    //const transform2 = mat4.fromRotation(out ,1.6, [-1, 1, 1]);
    const inst2 = tcm.getInstance(this.suzanne);
    //tcm.setTransform(inst2, transform);
    inst2.delete();
    
    //console.log("Trans2: " + transform2);
    vec3.rotateY(eye, eye, center, radians);
    this.camera.lookAt(eye, center, up);
    
    //if (!this.trackball.isIdle())
    this.renderer.render(this.swapChain, this.view);
    window.requestAnimationFrame(this.render);
  }
  resize() {
    const dpr = window.devicePixelRatio;
    const width = this.canvas.width = window.innerWidth * dpr;
    const height = this.canvas.height = window.innerHeight * dpr;
    this.view.setViewport([0, 0, width, height]);
    this.camera.setProjectionFov(45, width / height, 1.0, 10.0, Fov.VERTICAL);
  }
}

