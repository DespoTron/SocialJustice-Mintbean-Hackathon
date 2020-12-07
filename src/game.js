const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      // debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
}

var player
var stars
var bombs
var platforms
var cursors
var score = 0
var gameOver = false
var scoreText

var game = new Phaser.Game(config)

function preload() {
  this.load.image('sky', 'assets/sky.png')
  this.load.image('grass', 'assets/land-clipart-5.png')
  this.load.image('ground', 'assets/platform.png')
  this.load.image('star', 'assets/star.png')
  this.load.image('carrot', 'assets/carrot.png')
  // this.load.image("chicken", "assets/chicken.png");
  this.load.image('hamburger', 'assets/hamburger.png')
  this.load.image('tree', 'assets/tree.png')
  // this.load.image("bike", "assets/bike.png");
  this.load.image('bomb', 'assets/bomb.png')
  this.load.image('bg2', 'assets/nat2.png')
  this.load.spritesheet('dud', 'assets/sprite_pink.png', {
    frameWidth: 32,
    frameHeight: 32,
  })
}

function create() {
  //  A simple background for our game
  this.add.image(400, 300, 'sky')
  // bg2 = this.add.image(100, 100, 'bg2')

  // //  The platforms group contains the ground and the 2 ledges we can jump on
  // platforms = this.physics.add.staticGroup()

  // //  Here we create the ground.
  // //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  // platforms.create(0, 568, 'sky').setScale(1).refreshBody()

  // //  Now let's create some ledges
  // platforms.create(600, 400, 'ground')
  // platforms.create(50, 250, 'ground');
  // platforms.create(750, 220, 'ground');

  // The player and its settings
  player = this.physics.add.sprite(0, 600, 'dud').setScale(1)
  // cursors = game.input.keyboard.createCursorKeys()
  this.physics.add.collider(player, 'sky')
  // player.body.collideWorldBounds = true
  player.setCollideWorldBounds(true)

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dud', {
      start: 3,
      end: 5,
    }),
    frameRate: 5,
    repeat: -1,
  })
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dud', {
      start: 6,
      end: 8,
    }),
    frameRate: 5,
    repeat: -1,
  })
  this.anims.create({
    key: 'up',
    frames: this.anims.generateFrameNumbers('dud', {
      start: 9,
      end: 11,
    }),
    frameRate: 5,
    repeat: -1,
  })
  this.anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers('dud', {
      start: 0,
      end: 2,
    }),
    frameRate: 5,
    repeat: -1,
  })

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys()

  //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  stars = this.physics.add.group({
    key: 'star',
    repeat: 4,
    setXY: { x: 12, y: 0, stepX: 70 },
  })

  stars.children.iterate(function (child) {
    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
  })

  carrots = this.physics.add.group({
    key: 'carrot',
    repeat: 5,
    setXY: { x: 0, y: 0, stepX: 120 },
  })

  carrots.children.iterate(function (child) {
    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4))
  })

  hamburgers = this.physics.add.group({
    key: 'hamburger',
    repeat: 3,
    setXY: { x: 40, y: 0, stepX: 210 },
  })

  hamburgers.children.iterate(function (child) {
    //  Give each star a slightly different bounce
    child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.9))
  })

  trees = this.physics.add.group()
  bombs = this.physics.add.group()

  //  The score
  scoreText = this.add.text(16, 16, 'score: 0', {
    fontSize: '32px',
    fill: '#000',
  })

  //  Collide the player and the stars with the platforms
  this.physics.add.collider(player, platforms)
  this.physics.add.collider(stars, 'sky')
  this.physics.add.collider(carrots, 'sky')
  this.physics.add.collider(hamburgers, 'sky')
  this.physics.add.collider(bombs, 'sky')
  this.physics.add.collider(trees, 'sky')

  //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, stars, collectStar, null, this)

  this.physics.add.overlap(player, carrots, collectCarrot, null, this)

  this.physics.add.overlap(player, hamburgers, collectHamburger, null, this)

  this.physics.add.collider(bombs, trees, hitTree, null, this)
  this.physics.add.collider(player, bombs, hitBomb, null, this)
}

function update() {
  player.body.setVelocity(0)

  if (gameOver) {
    return
  }

  if (cursors.left.isDown) {
    player.anims.play('left', true)
    player.body.setVelocity(-300)
  } else if (cursors.right.isDown) {
    player.anims.play('right', true)
    player.body.setVelocity(300)
  }

  if (cursors.down.isDown) {
    player.anims.play('down', true)
    player.body.setVelocity(300)
  } else if (cursors.up.isDown) {
    player.anims.play('up', true)
    player.body.setVelocity(-300)
  }
  // } else {
  //   player.body.setVelocity(0)
  // }
}

function collectStar(player, star) {
  star.disableBody(true, true)

  //  Add and update the score
  score -= 5
  scoreText.setText('Score: ' + score)

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true)
    })
  }
}

function collectCarrot(player, carrot) {
  carrot.disableBody(true, true)

  //  Add and update the score
  score -= 10
  scoreText.setText('Score: ' + score)

  if (carrots.countActive(true) === 0) {
    //  A new batch of stars to collect
    carrots.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true)
    })

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400)

    var tree = trees.create(x, 16, 'tree')
    tree.setBounce(1)
    tree.setCollideWorldBounds(true)
    tree.setVelocity(Phaser.Math.Between(-200, 200), 20)
    tree.allowGravity = false
  }
}

function collectHamburger(player, hamburger) {
  hamburger.disableBody(true, true)

  //  Add and update the score
  score += 25
  scoreText.setText('Score: ' + score)

  if (hamburgers.countActive(true) === 0) {
    //  A new batch of stars to collect
    hamburgers.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true)
    })

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400)

    var bomb = bombs.create(x, 16, 'bomb')
    bomb.setBounce(1)
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    bomb.allowGravity = false
  }
}

function hitTree(bomb, tree) {
  bomb.destroy()

  // player.setTint(0xff0000);

  // player.anims.play("turn");

  // gameOver = true;
}

function hitBomb(player, bomb) {
  this.physics.pause()

  player.setTint(0xff0000)

  player.anims.play('turn')

  gameOver = true
}
