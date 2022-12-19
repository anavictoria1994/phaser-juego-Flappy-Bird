class Escena extends Phaser.Scene {
  constructor(){
    super('init');
  }

    preload() {
       this.load.image('fondo','assets/img/fondoM.JPG');
       this.load.spritesheet('heroe','assets/img/pulpo.png', {frameWidth: 50, frameHeight: 50});
       this.load.image('pipe0','assets/img/cuerpoL0.png');
       this.load.image('pipeArriba0','assets/img/tapaLataArriba0.png');
       this.load.image('pipeAbajo0','assets/img/tapaLata0.png');
       
       //Otro tipo de tuberia 
       this.load.image('pipe1','assets/img/cuerpoB1.png');
       this.load.image('pipeArriba1','assets/img/tapaBotellaArriba1.png');
       this.load.image('pipeAbajo1','assets/img/tapaBotella1.png'); 
    }

    create() {
      //Mover la Imagen de fondo
      this.bg = this.add.tileSprite(480, 320, 960, 640, 'fondo').setScrollFactor(0);

      this.player = this.physics.add.sprite(50, 100, 'heroe');

      this.anims.create({
        key: 'volar',
        frames: this.anims.generateFrameNumbers('heroe', {start: 0, end: 1}),
        frameRate: 10,
        repeat: -1,
      });
      this.player.play('volar');

      this.anims.create({
        key: 'saltar',
        frames: this.anims.generateFrameNumbers('heroe', {start: 2, end: 2}),
        frameRate: 7,
        repeat: 1,
      });

      this.input.keyboard.on('keydown', (event) => {
        if (event.keyCode === 32) {
          this.saltar();
        }
      });
      this.input.on('pointerdown', () => this.saltar());
      this.player.on('animationcomplete', this.animationComplete, this);
      this.nuevaColumna();

      //Cunado algo choca contra los limites de la pantalla
      this.physics.world.on('worldbounds', (body) => {
        this.scene.start('finScene');
      });
    
      this.player.setCollideWorldBounds(true);
      this.player.body.onWorldBounds = true;

    }
    saltar() {
      this.player.setVelocityY(-200);
      this.player.play('saltar');
    }

    animationComplete(animation, frame, sprite) {
      if (animation.key === 'saltar') {
        this.player.play('volar');
      }
    }

    update(time){
      this.bg.tilePositionX = time*0.1;
    }

    nuevaColumna() {
      //Una columna es un grupo de cubos
      const columna = this.physics.add.group();
      //Cada columna tendrá un hueco (zona en la que no hay cubos) por dónde pasará el super héroe
      const hueco = Math.floor(Math.random() * 5) + 1;
      const aleatorio = Math.floor(Math.random() * 2);
      for (let i = 0; i < 8; i++) {
          //El hueco estará compuesto por dos posiciones en las que no hay cubos, por eso ponemos hueco +1
        if (i !== hueco && i !== hueco + 1 && i !== hueco - 1) {
          let cubo;
          if (i == hueco - 2) {
            cubo = columna.create(960, i * 100, `pipeArriba${aleatorio}`);
          } else if (i == hueco + 2) {
            cubo = columna.create(960, i * 100, `pipeAbajo${aleatorio}`);
          } else {
            cubo = columna.create(960, i * 100, `pipe${aleatorio}`);
          }
          cubo.body.allowGravity = false;
        }
      }
      columna.setVelocityX(-200);
      //Detectaremos cuando las columnas salen de la pantalla...
      columna.checkWorldBounds = true;
      //... y con la siguiente línea las eliminaremos
      columna.outOfBoundsKill = true;
      //Cada 1000 milisegundos llamaremos de nuevo a esta función para que genere una nueva columna
      this.time.delayedCall(1000, this.nuevaColumna, [], this);
      //Super posicion entre el jugaro y la columna
      this.physics.add.overlap(this.player, columna, this.hitColumna, null, this);
    }

    hitColumna() {
      this.scene.start('finScene');
    } 

}

class EscenaFin extends Phaser.Scene{
  constructor(){
    super('finScene');
  }

  preload(){
    this.load.image('fondoFin', 'assets/img/perder-juego.JPG');
  }
  create(){
    this.add.sprite(480,320, 'fondoFin');
    this.input.on('pointerdown', () => this.volverAJugar())
  }
  volverAJugar(){
   this.scene.start('init'); 
  }

}

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    scene: [Escena,EscenaFin],
    scale: {
		mode: Phaser.Scale
    },
    physics: {
		default: 'arcade',
		arcade: {
			//debug: true,
			gravity: {
				y: 500,
			},
		},
	},
};

new Phaser.Game(config);

