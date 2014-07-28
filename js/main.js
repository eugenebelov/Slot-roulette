(function init() {

  var GameView = {
    preloader: document.getElementById("preloader"),
    gameSlot: document.getElementById("game-slot"),
    gameScene: document.getElementById("game-scene"),
    list: document.getElementById("symbolSelectionList"),
    winAnimation: document.getElementById("winwin"),
    init: function() {
      document.addEventListener('updateSelectList', this.updateSelectList);
      document.addEventListener('allImagesLoaded', this.showGameScene);
    },

    showGameScene: function(e) {
      GameView.gameScene.className = 'view-game';
    },

    updateSelectList:function(e) {
      GameView.list = document.getElementById("symbolSelectionList");
      GameModel.get().forEach(function(obj, index) {
        GameView.list[index] = new Option(obj.title, obj.value);
      });

      Game.selectSymbol(GameView.list[0].value);
    }
  };

  var GameModel = {
    fetch: function (path, callback) {
      var xmlhttp;

      if (window.XMLHttpRequest) {
          xmlhttp = new XMLHttpRequest();
      }
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 ) {
             if(xmlhttp.status == 200) {
                 return callback(xmlhttp.response);
             }
             else if(xmlhttp.status == 400) { console.log('There was an error 400') }
             else { console.log('something else other than 200 was returned') }
          }
      }
      xmlhttp.open("GET", path, true);
      xmlhttp.send();
    },

    fill: function(data) {
      GameModel.set(JSON.parse(data).types);
      GameModel.loadImage(JSON.parse(data).types);

      document.dispatchEvent(new CustomEvent("updateSelectList"));
    },

    loadImage: function(data) {
      var images = new Array()
      var count = 0;
      var val = 0;

      for (i = 0; i < data.length; i++) 
      {
        images[i] = new Image();
        images[i].onload = function() 
        {
          count++;
          if(count == i) {
            GameView.preloader.style.width = '100%';

            document.dispatchEvent(new CustomEvent("allImagesLoaded"));
          } else {
            val += 100 / i;
            GameView.preloader.style.width = (val + "%");
          }
        }
        images[i].src = data[i].image;
      }
    },

    set: function(model) {
      this.gameTypesList = model;
    },

    get: function() {
      return this.gameTypesList;
    }
  };

  window.Game = {
    start: function () {
      GameModel.fetch("./js/fake/fake-data.json", GameModel.fill);
    },

    selectSymbol: function(event) {
      this.userSelection = GameModel.get()[parseInt(event-1)];
      this.magic = [];
      var leng = 100;
      for(var i = 0; i < leng; i++) {
        if(i < parseInt(this.userSelection.k))
        {
          this.magic.push(1);
        } else {
          this.magic.push(0);
        }
      }
    },

    // mode: function(args) {
  
    //       var start = new Date; // сохранить время начала 

    //       var timer = setInterval(function() {

    //         // вычислить сколько времени прошло
    //         var progress = (new Date - start) / args.duration;
    //         if (progress > 1) progress = 1;

    //         // отрисовать анимацию
    //         args.step(progress);
            
    //         if (progress == 1) clearInterval(timer); // конец :)
             
    //       }, args.delay || 10); // по умолчанию кадр каждые 10мс


    // },

    spin: function() {
      var index = Math.round(Math.random() * 99);
      var isWin = this.randomize(this.magic)[index];
      
      if(isWin == 1) {
        console.log("User win -> throw selected", this.userSelection);

        // GameView.gameSlot.style( 'top', -600 );

      } else {
        var noWin = GameModel.get().concat();
        for(var i = 0; i < noWin.length; i++) {
          if(noWin[i].id === this.userSelection.id) {
            noWin.splice(i, 1);
          }
        }

        console.log("if no win -> throw something", noWin[Math.round(Math.random() * (noWin.length -1) )]);
      }

      GameView.gameSlot.classList.add('play');
      // Game.addAnimationListener(GameView.gameSlot, "AnimationStart", function() {
      //   console.log('animation - start')
      // });
      // Game.addAnimationListener(GameView.gameSlot, "AnimationIteration", function() {
      //   console.log('animation - iteration')
      // });
      // Game.addAnimationListener(GameView.gameSlot, "AnimationEnd", function() {
      //   console.log('animation - end')
      // });

      setTimeout(function() {
        GameView.gameSlot.classList.remove('play');
      }, 6000);
    },

    randomize: function(array) {
        return array.sort(function(a, b) {
            return Math.round(Math.random());
        });
    },

    addAnimationListener: function(element, type, callback) {
      var pfx = ["webkit", "moz", "MS", "o", ""];
      
      for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.addEventListener(pfx[p]+type, callback, false);
      }
    }
  }

  Game.start();
  GameView.init();

})();