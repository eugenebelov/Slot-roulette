(function init() {

  var GameView = {
    preloader: document.getElementById("preloader"),
    sceneCanvas: document.getElementById('gameSceneCanvas'),
    gameSceneContext: document.getElementById('gameSceneCanvas').getContext('2d'),
    gameSlotL: document.getElementById("gameSlotLeft"),
    gameSlotC: document.getElementById("gameSlotCenter"),
    gameSlotR: document.getElementById("gameSlotRight"),
    gameScene: document.getElementById("gameView"),
    gameControls: document.getElementById("gameControls"),
    selectedResult: document.getElementById("selectedResult"),
    spinButton: document.getElementById("spinButton"),
    spinWheel: document.getElementById("spinWheel"),
    list: document.getElementById("symbolSelectionList"),
    winAnimation: document.getElementById("winWin"),

    slotInCanvasLeft: {
      x: 0, y: 0,
      posX: 0, posY: 0,
      render: function (content) {
        GameView.gameSceneContext.drawImage(content, 
                                              this.x, 
                                                this.y + this.posY);
      }
    },

    slotInCanvasCenter: {
      x: 150, y: 0,
      posX: 0, posY: 0,
      render: function (content) {
        GameView.gameSceneContext.drawImage(content, 
                                              this.x, 
                                                this.y + this.posY);
      }
    },

    slotInCanvasRight: {
      x: 300, y: 0,
      posX: 0, posY: 0,
      render: function (content) {
        GameView.gameSceneContext.drawImage(content, 
                                              this.x, 
                                                this.y + this.posY);
      }
    },

    resetCanvas: function() {
      this.gameSceneContext.clearRect(0, 0, parseInt(this.canvasWidth), parseInt(this.canvasHeight));
    },

    doMask: function() { 
      this.gameSceneContext.save();
      this.gameSceneContext.beginPath();
      this.gameSceneContext.moveTo(0, 0);
      this.gameSceneContext.lineTo(0, 80);
      this.gameSceneContext.lineTo(420, 80);
      this.gameSceneContext.lineTo(420, 0);
      this.gameSceneContext.closePath();
      this.gameSceneContext.clip();
    },

    init: function() {
      document.addEventListener('updateSelectList', this.updateSelectList.bind(this) );
      document.addEventListener('allImagesLoaded', this.showGameScene);
      document.addEventListener('winEvent', this.showWin);
      document.addEventListener('loseEvent', this.showLose);
    },

    AddAnimationEventListener: function(element, type, callback) {
        var pfx = ["webkit", "moz", "MS", "o", ""];
        for (var p = 0; p < pfx.length; p++) {
          if (!pfx[p]) type = type.toLowerCase();

          element.addEventListener(pfx[p] + type, callback, false);
        }
    },

    RemoveAnimationEventListener: function(element, type, callback) {
        var pfx = ["webkit", "moz", "MS", "o", ""];
        for (var p = 0; p < pfx.length; p++) {
          if (!pfx[p]) type = type.toLowerCase();

          element.removeEventListener(pfx[p] + type, callback, false);
        }
    },

    showGameScene: function(e) {
      GameView.preloader.className = 'hidden';
      GameView.gameScene.className = 'view-game fadeIn animated';

      var container = document.getElementById("spinContainer");

      GameView.canvasWidth = window.getComputedStyle(container, null).width;
      GameView.canvasHeight = window.getComputedStyle(container, null).height;

      GameView.sceneCanvas.setAttribute('width', window.getComputedStyle(container, null).width);
      GameView.sceneCanvas.setAttribute('height', window.getComputedStyle(container, null).height);

      document.dispatchEvent(new CustomEvent("updateSelectList"));
    },

    showWin: function(e) {
      var handler = function() {
        GameView.RemoveAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
        console.log("win animation end");        

        GameView.winAnimation.innerHTML = 'You Win!';
        GameView.winAnimation.className = "win-animation tada animated";
      };

      GameView.AddAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
      GameView.gameControls.className = "game-controls fadeInDelayed animated";
    },

    showLose: function(e) {

      var handler = function() {
        GameView.RemoveAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
        console.log("lose animation end");

        GameView.winAnimation.innerHTML = "You Lose! <br /><span style='font-size:20px'>Spin the wheel!</span>";
        GameView.winAnimation.className = "win-animation wobble animated";
      }

      GameView.AddAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
      GameView.gameControls.className = "game-controls fadeInDelayed animated";
    },

    updateSelectList:function(e) {
      this.list = document.getElementById("symbolSelectionList");
      this.doMask();

      GameModel.get().forEach(function(obj, index) {
        this.list[index] = new Option(obj.title, obj.value);
        
        this.slotInCanvasLeft.y = 
          this.slotInCanvasCenter.y = 
            this.slotInCanvasRight.y = index * 80;
        
        this.slotInCanvasLeft.render(GameModel.getImages()[index]);
        this.slotInCanvasCenter.render(GameModel.getImages()[index]);
        this.slotInCanvasRight.render(GameModel.getImages()[index]);

      }.bind(this));
      
      this.gameSceneContext.restore();

      Game.selectSymbol(this.list[0].value);
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
            GameModel.setImages(images);

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
    },

    setImages: function(images) {
      this.imageScope = images;
    },

    getImages: function() {
      return this.imageScope;
    }
  };

  window.Game = {
    start: function () {
      GameModel.fetch("./js/fake/fake-data.json", GameModel.fill);
    },

    update: function (modifier) {
      // if(GameView.slotInCanvasLeft.y >= 200) {
      //   GameView.slotInCanvasLeft.y = 0;
      // }

      GameView.slotInCanvasLeft.y = modifier;

      console.log(GameView.slotInCanvasLeft.y)
    },

    render: function (coords) {
      // var now = Date.now();
      // var delta = now - then;

      Game.update(coords);

      // then = now;

      GameView.gameSceneContext.clearRect(0, 0, parseInt(GameView.canvasWidth), parseInt(GameView.canvasHeight));

      /// use save when using clip Path
      GameView.gameSceneContext.save();

      GameView.gameSceneContext.beginPath();
      GameView.gameSceneContext.moveTo(0, 0);
      GameView.gameSceneContext.lineTo(0, 80);
      GameView.gameSceneContext.lineTo(150, 80);
      GameView.gameSceneContext.lineTo(150, 0);

      GameView.gameSceneContext.closePath();

      /// define this Path as clipping mask
      GameView.gameSceneContext.clip();

      /// draw the image

      GameModel.get().forEach(function(obj, index) {
        GameView.gameSceneContext.drawImage(GameModel.getImages()[index], 
                                              GameView.slotInCanvasLeft.x, 
                                                GameView.slotInCanvasLeft.y + (GameView.slotInCanvasLeft.posY + index * 80));
      });

      /// reset clip to default
      GameView.gameSceneContext.restore();
    },

    gameLoop: function() {
      console.log("game loop");

      // var now = Date.now();
      // var delta = now - then;

      // Game.update(delta / 1000);
      // Game.render();

      // then = now;

      // requestAnimationFrame(Game.gameLoop);
      // setInterval(Game.render, 700);

      var from = -400;
      var to = 0;

      var numOfLoops = 3;
      function doOneRotation (endCallback) 
      {
        var start = new Date().getTime();
        var interval = setInterval( function(){
                                    var step = Math.min(1, (new Date().getTime() - start) / 700);

                                    console.log("interval1", from + step * (to - from));
                                    Game.render(from + step * (to - from))

                                    if(step == 1)
                                    {
                                      endCallback();
                                      clearInterval(interval);
                                    }
                                  }, 20);
      }

      function whatNext()
      {
        console.log(numOfLoops)
        numOfLoops--;
        (numOfLoops > 0) ? doOneRotation(whatNext) : console.log("finish");
      }

      doOneRotation(whatNext);
    },

    selectSymbol: function(event) {
      this.userSelection = GameModel.get()[parseInt(event-1)];
      GameView.selectedResult.src = this.userSelection.image;
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

    animate: function(elem, style, unit, from, to, time, finish, callback) {
      if( !elem) return;
      var numOfLoops = 3;
      var callbackHandler = callback;
      var slotHeight = parseInt(window.getComputedStyle(GameView.spinWheel, null).getPropertyValue("height")) * -1;

      function doOneRotation (endCallback) 
      {
        var start = new Date().getTime();
        var interval = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / time);
                                      elem[0].style[style] = (from + step * (to - from)) + unit;
                                      elem[1].style[style] = (from + step * (to - from)) + unit;
                                      elem[2].style[style] = (from + step * (to - from)) + unit;
                                      if(step == 1)
                                      {
                                        clearInterval(interval);
                                        endCallback();
                                      }
                                    }, 20);

        elem[0].style[style] = from + unit;
        elem[1].style[style] = from + unit;
        elem[2].style[style] = from + unit;
      }

      function doFinishRotation () 
      {
        var start = new Date().getTime();
        var finishTime1 = (GameModel.get().length - finish[0]) * (500 / (GameModel.get().length - finish[0]));
        var finishTime2 = (GameModel.get().length - finish[1]) * (500 / (GameModel.get().length - finish[1]));
        var finishTime3 = (GameModel.get().length - finish[2]) * (500 / (GameModel.get().length - finish[2]));
        var interval1 = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / finishTime1);
                                      elem[0].style[style] = (from + step * ((parseInt(finish[0]) * slotHeight) - from)) + unit;
                                      if(step == 1) { 
                                        clearInterval(interval1);
                                        // callbackHandler();
                                      }
                                    }, 20);

        var interval2 = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / finishTime2);
                                      elem[1].style[style] = (from + step * ((parseInt(finish[1]) * slotHeight) - from)) + unit;
                                      if(step == 1) { 
                                        clearInterval(interval2);
                                        // callbackHandler();
                                      }
                                    }, 20);

        var interval3 = setInterval( function() 
                                    {
                                      var step = Math.min(1, (new Date().getTime() - start) / finishTime3);
                                      elem[2].style[style] = (from + step * ((parseInt(finish[2]) * slotHeight) - from)) + unit;
                                      if(step == 1) { 
                                        clearInterval(interval3);
                                        callbackHandler();
                                      }
                                    }, 20);

        elem[0].style[style] = from + unit;
        elem[1].style[style] = from + unit;
        elem[2].style[style] = from + unit;
      }

      function whatNext()
      {
        numOfLoops--;
        (numOfLoops > 0) ? doOneRotation(whatNext) : doFinishRotation();
      }

      doOneRotation(whatNext);
      
    },

    getEndSpinElement: function(winflag) {
      if(winflag == 1) {
        return Game.userSelection.id;
      } else {
        var noWin = GameModel.get().concat();
        for(var i = 0; i < noWin.length; i++) {
          if(noWin[i].id === this.userSelection.id) {
            noWin.splice(i, 1);
          }
        }

        return noWin[Math.round(Math.random() * (noWin.length -1) )].id;
      }
    },

    spinWheel: function() {
      var self = this;
      var slotHeight = parseInt(window.getComputedStyle(GameView.spinWheel, null).getPropertyValue("height")) * -1;
      var index1 = Math.round(Math.random() * 99),
          index2 = Math.round(Math.random() * 99),
          index3 = Math.round(Math.random() * 99),
          isWin1 = this.randomize(this.magic)[index1],
          isWin2 = this.randomize(this.magic)[index2],
          isWin3 = this.randomize(this.magic)[index3];

      console.log(isWin1, isWin2, isWin3);

      GameView.spinButton.className = "btn rotation";

      Game.gameLoop();

      var handler = function() {
        GameView.RemoveAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
        GameView.winAnimation.innerHTML = '<br />';
        GameView.winAnimation.className = "win-animation";
        GameView.spinButton.className = "btn";

        self.animate(
            [GameView.gameSlotL, GameView.gameSlotC, GameView.gameSlotR], "top", "px", 
            GameModel.get().length * slotHeight, 0, 200, 
            [self.getEndSpinElement(isWin1), self.getEndSpinElement(isWin2), self.getEndSpinElement(isWin3)],
            function() {
              if(isWin1 == 1 && isWin2 == 1 ||
                isWin2 == 1 && isWin3 == 1 ||
                isWin3 == 1 && isWin1 == 1 ||
                isWin1 == 1 && isWin2 == 1 && isWin3 == 1)
              {
                document.dispatchEvent(new CustomEvent("winEvent"));
              } else {
                document.dispatchEvent(new CustomEvent("loseEvent"));
              }
            });
      }

      GameView.AddAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
      GameView.gameControls.className = "game-controls fadeOut animated";
    },

    randomize: function(array) {
        return array.sort(function(a, b) {
            return Math.round(Math.random());
        });
    }
  }

  var then = Date.now();
  var w = window;
  requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

  Game.start();
  GameView.init();

})();