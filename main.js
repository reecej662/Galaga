enchant();

var MOVESPEED = 5;

var PLAYERFRAME = 0;
var ENEMYFRAME = [16, 17, 24, 25, 32, 33, 40, 41];
var EEXPLODE = [0, 1, 2, 3, 4];
var PEXPLODE = [5, 6, 7, 8];
var PLAYERSHOOTFRAME = 7;
var ENEMYSHOOTFRAME = 15;

var SPRITE_SIZE = 32;

// Conveniently generate a random integer from 0 up to the limit for the four different enemies.
function randInt(limit) {
    return Math.floor(Math.random() * limit);
}

window.onload = function () {
    game = new Game(320, 320);
    game.fps = 24;
    game.score = 0;
    game.scale = 2;
    game.touched = false;
    game.preload('sprites.png', 'explosion.png');
    game.onload = function () {
        player = new Player(160, 275);
        enemies = new Array();
        game.rootScene.backgroundColor = 'black';

        game.rootScene.addEventListener('enterframe', function () {
            if(rand(1000) < game.frame / 20 * Math.sin(game.frame / 100) + game.frame / 20 + 50) {
                var x = rand(320);
                var omega = x < 160 ? 0.01 : -0.01;
                var enemy = new Enemy(x, 0, omega);
                enemy.key = game.frame;
                enemies[game.frame] = enemy;
            }
            scoreLabel.score = game.score;
        });
        scoreLabel = new ScoreLabel(8, 8);
        game.rootScene.addChild(scoreLabel);

        game.keybind(65, 'up'); // 'A'
        game.keybind(90, 'down'); // 'Z'
        game.keybind(32, 'a'); // space
    };
    game.start();
};


var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y) {
        enchant.Sprite.call(this, SPRITE_SIZE, SPRITE_SIZE);
        this.image = game.assets['sprites.png'];
        this.x = x;
        this.y = y;
        this.frame = PLAYERFRAME;

        this.addEventListener('enterframe', function () {
            if(game.input.a && game.frame % 3 == 0) {
                var s = new PlayerShoot(this.x, this.y);
            }
            if (game.input.left && this.x > 0) {
                this.x -= (MOVESPEED + 1);
            }
            if (game.input.right && this.x < (320 - SPRITE_SIZE)) {
                this.x += (MOVESPEED + 1);
            }
        });

        game.rootScene.addChild(this);
    }
});


var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y, omega) {
        enchant.Sprite.call(this, SPRITE_SIZE, SPRITE_SIZE);
        this.image = game.assets['sprites.png'];
        this.x = x;
        this.y = y;
        this.omega = omega;

        var enemyframes = randInt(4) * 2;
        var framenum = enemyframes + 1;
        this.frame = ENEMYFRAME[framenum];

        this.direction = 90;
        this.moveSpeed = 3;

        this.addEventListener('enterframe', function () {
            this.move();
            if(this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
                this.remove();
            } else if(this.age % 40 == 0) {
                var s = new EnemyShoot(this.x, this.y);
            }

            if(player.within(this, 8)) {
                var x = player.x - 16;
                var y = player.y - 16;
                player.remove();
                this.remove();
                var explosion = new playerexplode(x, y);
            }


            if(this.age % 7 == 0) {
              if(framenum == enemyframes + 1){
                framenum = framenum - 1;
              }else if(framenum == enemyframes){
                framenum = framenum + 1;
              }
              this.frame = ENEMYFRAME[framenum];
            }
        });
        game.rootScene.addChild(this);
    },

    move: function () {
        this.direction += this.omega;
        this.x -= this.moveSpeed * Math.cos(this.direction / 180 * Math.PI);
        this.y += this.moveSpeed * Math.sin(this.direction / 180 * Math.PI)
    },

    remove: function () {
        game.rootScene.removeChild(this);
        delete enemies[this.key];
    }
});


var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y, direction) {
        enchant.Sprite.call(this, SPRITE_SIZE, SPRITE_SIZE);
        this.image = game.assets['sprites.png'];
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.moveSpeed = 10;
        this.addEventListener('enterframe', function () {
            //this.x += this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * direction;
            if(this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
                this.remove();
            }
        });
        game.rootScene.addChild(this);
    },
    remove: function () {
        game.rootScene.removeChild(this);
        delete this;
    }
});


var PlayerShoot = enchant.Class.create(Shoot, {
    initialize: function (x, y) {
        Shoot.call(this, x, y, -2);
        this.frame = PLAYERSHOOTFRAME;
        this.addEventListener('enterframe', function () {
            for (var i in enemies) {
                if(enemies[i].intersect(this)) {
                    this.remove();
                    var explosion = new enemyexplode(enemies[i].x, enemies[i].y);
                    enemies[i].remove();
                    game.score += 100;
                }
            }
        });
    }
});


var EnemyShoot = enchant.Class.create(Shoot, {
    initialize: function (x, y) {
        Shoot.call(this, x, y, 1);
        this.frame = ENEMYSHOOTFRAME;
        this.addEventListener('enterframe', function () {
            if(player.within(this, 8)) {
                var x = player.x - 16;
                var y = player.y - 16;
                player.remove();
                this.remove();
                var explosion = new playerexplode(x, y);
            }
        });
    }
});


var enemyexplode = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
      enchant.Sprite.call(this, 64, 64);
      this.image = game.assets['explosion.png'];
      this.x = x;
      this.y = y;
      var i = 0;

      this.addEventListener('enterframe', function() {
          if(i < 5){
            this.frame = EEXPLODE[i];
            i++;
          }
          if(this.age % 6 == 0){
            this.remove();
          }
      });

      game.rootScene.addChild(this);
    },

  remove: function () {
    game.rootScene.removeChild(this);
    delete this;
  }
});

var playerexplode = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
      enchant.Sprite.call(this, 64, 64);
      this.image = game.assets['explosion.png'];
      this.x = x;
      this.y = y;
      var i = 0;
      this.frame = 9;

      this.addEventListener('enterframe', function() {
          if(this.age % 6 == 0 && i < 4){
            this.frame = PEXPLODE[i];
            i++;
          }
          if(this.age % 10 == 0 && i == 4){
            this.frame = PEXPLODE[3];
            this.remove();
            game.end(game.score, "SCORE: " + game.score)
          }
      });

      game.rootScene.addChild(this);
    },

  remove: function () {
    game.rootScene.removeChild(this);
    delete this;
  }
});
