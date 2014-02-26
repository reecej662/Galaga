enchant();

var MOVESPEED = 5;

var PLAYERFRAME = 1;
var ENEMYFRAME = 17;
var PLAYERSHOOTFRAME = 40;
var ENEMYSHOOTFRAME = 40;

window.onload = function () {
    game = new Game(320, 320);
    game.fps = 24;
    game.score = 0;
    game.scale = 2;
    game.touched = false;
    game.preload('sprites.png');
    game.onload = function () {
        player = new Player(160, 250);
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
        enchant.Sprite.call(this, 47, 47);
        this.image = game.assets['sprites.png'];
        this.x = x;
        this.y = y;
        this.frame = PLAYERFRAME;

        this.addEventListener('enterframe', function () {
            if(game.input.a && game.frame % 3 == 0) {
                var s = new PlayerShoot(this.x, this.y);
            }
            if (game.input.left) {
                this.x -= (MOVESPEED + 1);
            }
            if (game.input.right) {
                this.x += (MOVESPEED + 1);
            }
        });

        game.rootScene.addChild(this);
    }
});


var Enemy = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y, omega) {
        enchant.Sprite.call(this, 47, 47);
        this.image = game.assets['sprites.png'];
        this.x = x;
        this.y = y;
        this.frame = ENEMYFRAME;
        this.omega = omega;

        this.direction = 90;
        this.moveSpeed = 3;

        this.addEventListener('enterframe', function () {
            this.move();
            if(this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
                this.remove();
            } else if(this.age % 40 == 0) {
                var s = new EnemyShoot(this.x, this.y);
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
        enchant.Sprite.call(this, 47, 47);
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
                game.end(game.score, "SCORE: " + game.score)
            }
        });
    }
});
