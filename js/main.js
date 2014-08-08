(function init() {

  var GameView = {
    preloader: document.getElementById("preloader"),
    sceneCanvas: document.getElementById('gameSceneCanvas'),
    gameSceneContext: document.getElementById('gameSceneCanvas').getContext('2d'),
    winMessageCanvas: document.getElementById('winMessageCanvas'),
    winMessageContext: document.getElementById('winMessageCanvas').getContext('2d'),
    gameScene: document.getElementById("gameView"),
    gameControls: document.getElementById("gameControls"),
    selectedResult: document.getElementById("selectedResult"),
    spinButton: document.getElementById("spinButton"),
    list: document.getElementById("symbolSelectionList"),
    winAnimation: document.getElementById("winWin"),

    slotInCanvasLeft: {
      x: 0, y: 0,
      posX: 0, posY: 0,
      render: function (content) {
        GameView.gameSceneContext.drawImage(content, 
                                              this.x + this.posX, 
                                                this.y + this.posY);
      }
    },

    slotInCanvasCenter: {
      x: 0, y: 0,
      posX: 0, posY: 0,
      render: function (content) {
        GameView.gameSceneContext.drawImage(content, 
                                              this.x + this.posX, 
                                                this.y + this.posY);
      }
    },

    slotInCanvasRight: {
      x: 0, y: 0,
      posX: 0, posY: 0,
      render: function (content) {
        GameView.gameSceneContext.drawImage(content, 
                                              this.x + this.posX, 
                                                this.y + this.posY);
      }
    },

    isMobile: {
      Android: function() {
          return navigator.userAgent.match(/Android/i);
      },
      iOS: function() {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      any: function() {
        return (this.Android() || this.iOS());
      }
    },

    resetCanvas: function() {
      this.gameSceneContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    },

    resetPartCanvas: function(fromX, fromY, toX) {
      this.gameSceneContext.clearRect(fromX, fromY, toX, this.canvasHeight);
    },

    doMask: function(offsetX, offsetY) { 
      this.gameSceneContext.save();
      this.gameSceneContext.beginPath();
      this.gameSceneContext.moveTo(0 + offsetX, 0 + offsetY);
      this.gameSceneContext.lineTo(0 + offsetX, GameView.slotHeight * 3 + offsetY);
      this.gameSceneContext.lineTo(GameView.canvasWidth + offsetX, GameView.slotHeight * 3 + offsetY);
      this.gameSceneContext.lineTo(GameView.canvasWidth + offsetX, 0 + offsetY);
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

      GameView.canvasWidth = parseInt(window.getComputedStyle(container, null).width);
      GameView.canvasHeight = parseInt(window.getComputedStyle(container, null).height);

      GameView.sceneCanvas.setAttribute('width', window.getComputedStyle(container, null).width);
      GameView.sceneCanvas.setAttribute('height', window.getComputedStyle(container, null).height);

      GameView.winMessageCanvas.setAttribute('width', window.getComputedStyle(container, null).width);
      GameView.winMessageCanvas.setAttribute('height', window.getComputedStyle(container, null).height);

      GameView.slotInCanvasLeft.x = GameView.canvasWidth / 2 - (GameView.slotWidth * 1.5);
      GameView.slotInCanvasCenter.x = GameView.canvasWidth / 2 - (GameView.slotWidth / 2);
      GameView.slotInCanvasRight.x = GameView.canvasWidth / 2 + (GameView.slotWidth / 2);

      // GameView.slotInCanvasLeft.posY = GameView.canvasHeight / 2 - GameView.slotHeight / 2;
      // GameView.slotInCanvasCenter.posY = GameView.canvasHeight / 2 - GameView.slotHeight / 2;
      // GameView.slotInCanvasRight.posY = GameView.canvasHeight / 2 - GameView.slotHeight / 2;

      GameView.slotInCanvasLeft.posY = 50;
      GameView.slotInCanvasCenter.posY = 50;
      GameView.slotInCanvasRight.posY = 50;

      Game.drawWinText("Spin the wheel!");

      document.dispatchEvent(new CustomEvent("updateSelectList"));
    },

    showWin: function(e) {
      var handler = function() {
        GameView.RemoveAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
        console.log("win animation end");     

        Game.drawWinText("You Win!");
        GameView.winMessageCanvas.className = "tada animated";

        // GameView.winAnimation.innerHTML = 'You Win!';
        // GameView.winAnimation.className = "win-animation tada animated";
      };

      GameView.AddAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
      GameView.gameControls.className = "game-controls fadeInDelayed animated";
    },

    showLose: function(e) {

      var handler = function() {
        GameView.RemoveAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
        console.log("lose animation end");

        Game.drawWinText("You Lose!");
        // Game.drawWinText("Spin the wheel!");
        GameView.winMessageCanvas.className = "wobble animated";

        // GameView.winAnimation.innerHTML = "You Lose! <br /><span style='font-size:20px'>Spin the wheel!</span>";
        // GameView.winAnimation.className = "win-animation wobble animated";
      }

      GameView.AddAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
      GameView.gameControls.className = "game-controls fadeInDelayed animated";
    },

    updateSelectList:function(e) {
      this.list = document.getElementById("symbolSelectionList");

      GameModel.get().forEach(function(obj, index) {
        this.list[index] = new Option(obj.title, obj.value);
      }.bind(this));
    
      GameView.resetCanvas();

      Game.render([0, 0, 0], [true, true, true]);      

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

        if(GameView.isMobile.any()) { 
          images[i].src = data[i].image;
          GameView.slotWidth = 118;
          GameView.slotHeight = 78;
        } else {
          images[i].src = data[i].imageHigh;
          GameView.slotWidth = 235;
          GameView.slotHeight = 155;
        }
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

    render: function (coords, slots) {
      // GameView.doMask(0, GameView.canvasHeight/2 - GameView.slotHeight/2);
      GameView.doMask(0, 50);

      GameModel.get().forEach(function(obj, index) {

        if(slots[0] == true) {
          GameView.slotInCanvasLeft.y = coords[0] + index * GameView.slotHeight;
          GameView.slotInCanvasLeft.render(GameModel.getImages()[index]);
        } 
        if(slots[1] == true) {
          GameView.slotInCanvasCenter.y = coords[1] + index * GameView.slotHeight;
          GameView.slotInCanvasCenter.render(GameModel.getImages()[index]);
        } 
        if(slots[2] == true) {
          GameView.slotInCanvasRight.y = coords[2] + index * GameView.slotHeight;
          GameView.slotInCanvasRight.render(GameModel.getImages()[index]);
        } 

      });

      GameView.gameSceneContext.restore();
    },

    drawWinText: function(text, posX, posY) {
      GameView.winMessageContext.clearRect(0, 0, GameView.canvasWidth, GameView.canvasHeight);

      GameView.winMessageContext.fillStyle = "#F3EFE0";
      GameView.winMessageContext.shadowColor = "#000000";
      GameView.winMessageContext.shadowOffsetX = 1;
      GameView.winMessageContext.shadowOffsetY = 1;
      GameView.winMessageContext.shadowBlur = 2;
      GameView.winMessageContext.font = "bold 40pt Arial";

      var textWidth = GameView.winMessageContext.measureText(text).width / 2;

      GameView.winMessageContext.fillText(text, posX || GameView.canvasWidth/2 - textWidth, posY || GameView.canvasHeight/2);
      GameView.winMessageContext.font = 'bold 30px sans-serif';
    },

    animateCanvasSpin: function(from, to, loops, finishItemIndex, callback) {
      var callbackHandler = callback,
          numOfLoops = loops,
          slotHeight = GameView.slotHeight  * -1,
          interval = -1;

      function doOneRotation(endCallback) 
      {
        var start = new Date().getTime();
        var interval = setInterval( 
              function() {
                var step = Math.min(1, (new Date().getTime() - start) / 200);

                GameView.resetCanvas();
                Game.render([from + step * (to - from),
                                from + step * (to - from),
                                    from + step * (to - from)], [true, true, true]);

                if(step == 1)
                {
                  console.log("interval stop");
                  endCallback();
                  clearInterval(interval);
                }
              }, 20);
      }

      function doFinishRotation() 
      {
          var start = new Date().getTime(),
              itemsLength = GameModel.get().length,
              slotLY = 0,
              slotCY = 0,
              slotRY = 0;

          var finishTime1 = (itemsLength - finishItemIndex[0]) * (500 / (itemsLength - finishItemIndex[0])),
              finishTime2 = (itemsLength - finishItemIndex[1]) * (500 / (itemsLength - finishItemIndex[1])),
              finishTime3 = (itemsLength - finishItemIndex[2]) * (500 / (itemsLength - finishItemIndex[2]));

          var interval1 = setInterval( 
                function() {
                  var step = Math.min(1, (new Date().getTime() - start) / finishTime1);
                  slotLY = from + step * ((parseInt(finishItemIndex[0]) * slotHeight) - from);
                  GameView.resetPartCanvas(GameView.slotInCanvasLeft.x, 0, GameView.slotWidth);
                  Game.render([slotLY, 0, 0], [true, false, false]);

                  if(step == 1) { 
                    clearInterval(interval1);
                  }
                }, 20);

          var interval2 = setInterval( 
                function() {
                  var step = Math.min(1, (new Date().getTime() - start) / finishTime2);
                  slotCY = from + step * ((parseInt(finishItemIndex[1]) * slotHeight) - from);
                  GameView.resetPartCanvas(GameView.slotInCanvasCenter.x, 0, GameView.slotWidth);
                  Game.render([0, slotCY, 0], [false, true, false]);

                  if(step == 1) { 
                    clearInterval(interval2);
                  }
                }, 20);

          var interval3 = setInterval( 
                function() {
                  var step = Math.min(1, (new Date().getTime() - start) / finishTime3);
                  slotRY = from + step * ((parseInt(finishItemIndex[2]) * slotHeight) - from);
                  GameView.resetPartCanvas(GameView.slotInCanvasRight.x, 0, GameView.slotWidth);
                  Game.render([0, 0, slotRY], [false, false, true]);

                  if(step == 1) { 
                    clearInterval(interval3);
                    callbackHandler();
                  }
                }, 20);
      }

      function whatNext()
      {
        numOfLoops--;
        (numOfLoops > 0) ? doOneRotation(whatNext) : doFinishRotation();
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

      var index1 = Math.round(Math.random() * 99),
          index2 = Math.round(Math.random() * 99),
          index3 = Math.round(Math.random() * 99),
          isWin1 = this.randomize(this.magic)[index1],
          isWin2 = this.randomize(this.magic)[index2],
          isWin3 = this.randomize(this.magic)[index3];

      console.log("spinWheel", isWin1, isWin2, isWin3);

      GameView.spinButton.className = "btn rotation";

      var handler = function() {
        GameView.RemoveAnimationEventListener(GameView.gameControls, 'AnimationEnd', handler, false);
        // GameView.winAnimation.innerHTML = '<br />';
        // GameView.winAnimation.className = "win-animation";
        Game.drawWinText("");
        GameView.winMessageCanvas.className = "";

        GameView.spinButton.className = "btn";

        Game.animateCanvasSpin(GameModel.get().length * -80, 0, 3, 
                [self.getEndSpinElement(isWin1), 
                    self.getEndSpinElement(isWin2), 
                        self.getEndSpinElement(isWin3)],
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

  Game.start();
  GameView.init();

})();