const albedo_suffix = Filament.getSupportedFormatSuffix('astc s3tc');
const texture_suffix = Filament.getSupportedFormatSuffix('etc');
const environ = 'pillars_2k'
const ibl_url = `${environ}/${environ}_ibl.ktx`;
const sky_small_url = `${environ}/${environ}_skybox.ktx`;
const sky_large_url = `${environ}/${environ}_skybox.ktx`;
const filamat_url = 'texturedLit.filamat'; 
const filamesh_url = 'lucy.filamesh';

Filament.init([filamat_url, filamesh_url, sky_large_url, ibl_url], () => {
  window.Fov = Filament.Camera$Fov;
  window.LightType = Filament.LightManager$Type;	
  window.app = new App(document.getElementsByTagName('canvas')[0]);
});
class App {
  constructor(canvas) {
    this.canvas = canvas;
    const engine = this.engine = Filament.Engine.create(canvas);
    const scene = this.scene = engine.createScene();
    const material = engine.createMaterial(filamat_url);
    const matinstance = material.createInstance();
    const filamesh = this.engine.loadFilamesh(filamesh_url, matinstance);
    this.suzanne = filamesh.renderable;
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
    DraggingInit:2,
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
    const tcm = this.engine.getTransformManager();
    const inst = tcm.getInstance(this.suzanne);
    tcm.setTransform(inst, transform);
    inst.delete();
    const radians = Date.now() / 10000;
     var eye = [0, 0, 6];
     var center = [0, 2, 0];
     var up = [0, 1, 0];

    
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

